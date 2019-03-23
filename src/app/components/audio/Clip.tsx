import * as React from "react";
import { AudioTrack, AudioClip, audioInterface } from "lib/AudioInterface";
import { debug, log } from "utils/console";
import EditorInfo from "lib/AudioInterface/EditorInfo";
import Interactable from "../helpers/Interactable";
import EventManager from "lib/EventManager";
import StoreComponent from "lib/StoreComponent";
import { StoreType } from "app/audio_store";
import { deepCopy } from "utils/helpers";

interface ClipProps {
    clip: Proxied<AudioClip>,
    editorInfo: EditorInfo,
    eventManager: EventManager,
    is_selected?: boolean,
    selection_start: number,
    parent_track: AudioTrack,
    drag_callback: (clip: any, evt: any, delta: number) => void;
}
export default class Clip extends StoreComponent<StoreType, ClipProps> {
    state: any;
    parentEl: any;
    left_drag: boolean = false;
    right_drag: boolean = false;

    canvas_el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    left: number;
    width: number;
    canvas_invalidated: boolean = false;
    last_render_values: any = {};

    constructor(props: ClipProps) {
        super(audioInterface.store, props);
        this.state = { last_render_values: {}, left: 0, width: 0, mouse: 0, interacting: null };
        this.props.eventManager.on('drag', this.update_state.bind(this));
        this.props.eventManager.on('endDrag', this.release.bind(this));
        var fileIndex = audioInterface.files.findIndex(file => file.id === this.props.clip.file_id);
        var clipObserver = () => {
            console.log("forced update");
            this.forceUpdate()
        };
        this.store.add_observer([`files.${fileIndex}`, props.clip.__store_path__], clipObserver);
    }

    componentDidMount() {
        this.ctx = this.canvas_el.getContext('2d');
    }
    shouldComponentUpdate(nextProps: ClipProps, nextState) {
        return !this.props.clip ||
            this.state.interacting ||
            this.props.clip.track_position !== nextProps.clip.track_position ||
            nextProps.selection_start !== this.props.selection_start;
    }

    leftClicked(evt) {
        this.left_drag = true;
        evt.item_clicked = this.props.clip;
    }

    rightClicked(evt) {
        this.right_drag = true;
    }

    mouseDown(evt) {

    }

    mouseUp(evt) {
        this.setState({ interacting: null });
    }

    update_state(evt) {
        var clip = this.props.clip;
        var delta = this.pixels_to_seconds(evt.clientX - evt.start_x);
        if (this.state.interacting == 'left') {
            var length = Math.max(Math.min(evt.initial_clip_data.length - ((evt.initial_clip_data.start_position + delta) - evt.initial_clip_data.start_position), clip.max_length), 0),
                start_position = Math.min(Math.max(evt.initial_clip_data.start_position + delta, 0), clip.max_length),
                track_position = Math.min(Math.max(evt.initial_clip_data.track_position + delta, evt.initial_clip_data.track_position - (clip.max_length - evt.initial_clip_data.length)), (evt.initial_clip_data.track_position + evt.initial_clip_data.length));

            clip.set_property({
                start_position, length, track_position
            });

        } else if (this.state.interacting == 'right') {
            clip.set_property({
                length: Math.max(Math.min((evt.initial_clip_data.length + delta), clip.max_length), .01)
            });
        } else if (this.state.interacting == 'clip') {
            this.props.drag_callback(clip, evt, delta);
        }
    }

    release() {
        if (this.state.interacting === null)
            return;

        if (this.state.interacting === "clip") {
            audioInterface.store.did_update(["tracks"]);
        } else {
            audioInterface.store.did_update(this.props.clip.__store_path__);
        }
        this.setState({ interacting: null });
    }

    pixels_to_seconds(pixel_width) {
        return (pixel_width / (this.props.editorInfo.project_length * this.props.editorInfo.window_scale)) * (this.props.editorInfo.project_length);
    }

    update_display(element) {
    }

    set_interacting(evt: React.MouseEvent, interacting: string) {
        evt.stopPropagation()
        if (interacting) {
            var initial_clip_data;
            if (audioInterface.editorInfo.selection.track_selections &&
                audioInterface.editorInfo.selection.track_selections.length > 0) {
                initial_clip_data = [];
                audioInterface.editorInfo.selection.track_selections.forEach((track, tidx) => {
                    initial_clip_data[tidx] = [];
                    track.forEach((clip, idx) => {
                        initial_clip_data[tidx][idx] = Object.assign({}, audioInterface.tracks[tidx].clips[clip]);
                    });
                })
            } else {
                initial_clip_data = Object.assign({}, this.props.clip);
            }
            if (interacting === "clip") {
                audioInterface.store.will_update(["tracks"]);
            } else {
                audioInterface.store.will_update(this.props.clip.__store_path__);
            }
            this.props.eventManager.fire('beginDrag', { clientX: evt.clientX, initial_clip_data, interacting });
        } else {

            //this.props.eventManager.fire('endDrag', { clientX: evt.clientX, initial_clip_data: Object.assign({}, this.props.clip) });
        }
        this.setState({ interacting });
    }

    render_canvas(buff: AudioBuffer, width: number) {
        var clip = this.props.clip,
            ctx = this.ctx,
            el = this.canvas_el;
        const channel = buff.getChannelData(0);
        const rchannel = buff.getChannelData(1);
        var start_idx = Math.floor((clip.start_position / clip.max_length) * buff.length),
            end_idx = Math.floor(((clip.start_position + clip.length) / clip.max_length) * buff.length);
        ctx.save();
        ctx.clearRect(0, 0, width, el.height);
        ctx.translate(0, el.height / 2);
        ctx.fillStyle = "#FFF";
        ctx.globalAlpha = 0.4;
        const div = Math.round((end_idx - start_idx) / 500);
        const iwidth = Math.max(el.width / 500, 1);
        const margin = iwidth * 0.15;
        for (var i = start_idx; i <= end_idx; i += div) {
            var x = Math.round((i - start_idx) / div) * iwidth;
            var miny = 0, maxy = 0;
            for (var j = 0; j < div && (i + j) < channel.length; j++) {
                miny += Math.abs(channel[i + j]);
                maxy += Math.abs(rchannel[i + j]);
            }
            miny = (miny / div) * (el.height / 2);
            maxy = (maxy / div) * (el.height / 2);
            ctx.fillRect(Math.floor(x + margin),
                Math.round(0 - miny),
                Math.round(iwidth - (margin * 2)),
                Math.round(miny + maxy));
        }
        ctx.restore();
        if (this.state.last_render_values.length !== this.props.clip.length.toPrecision(5) ||
            this.state.last_render_values.start_position !== this.props.clip.start_position.toPrecision(5) ||
            this.state.last_render_values.file_id !== this.props.clip.file_id) {
            this.setState({
                last_render_values: {
                    length: (this.props.clip.length.toPrecision(5)),
                    start_position: (this.props.clip.start_position.toPrecision(5)),
                    file_id: (this.props.clip.file_id)
                }
            });
        }
        log("did draw", start_idx, end_idx);
    }

    render() {
        console.log("clip render");
        var clip = this.props.clip,
            editorInfo = this.props.editorInfo;

        if (editorInfo.project_length < (clip.track_position + clip.length)) {
            editorInfo.set_window({ project_length: clip.track_position + clip.length });
        }
        var left = (clip.track_position / editorInfo.project_length) * (editorInfo.project_length * editorInfo.window_scale),
            width = (clip.length / editorInfo.project_length) * (editorInfo.project_length * editorInfo.window_scale);

        var canvas_invalidated = false;
        if (this.state.last_render_values.length !== this.props.clip.length.toPrecision(5) ||
            this.state.last_render_values.start_position !== this.props.clip.start_position.toPrecision(5) ||
            this.state.last_render_values.file_id !== this.props.clip.file_id) {
            canvas_invalidated = true;
        } else {
            log("matching last render",
                this.state.last_render_values.length, this.props.clip.length.toPrecision(5),
                this.state.last_render_values.start_position, this.props.clip.start_position.toPrecision(5))
        }

        if (canvas_invalidated) {
            var file = audioInterface.files.find((file: AudioFile) => this.props.clip.file_id == file.id);
            if (!file || !this.ctx) {
                // draw as empty proxy
                log("Not drawing canvas because no context or file");
            } else {
                var buff = audioInterface.get_file_data(this.props.clip.file_id);
                if (!buff) {
                    log("Not drawing canvas because no file buffer");
                } else {
                    this.render_canvas(buff, width);
                }
            }
        }

        var clip_length_str = clip.length.toPrecision(2) + 's',
            clip_start_str = clip.start_position.toPrecision(2) + 's',
            clip_track_str = clip.track_position.toPrecision(2) + 's',
            file = audioInterface.files.find((file) => file.id === this.props.clip.file_id),
            file_name = file && file.file.name,
            clip_class = this.props.is_selected ? "track-clip selected" : "track-clip";
        return (<div className={clip_class}
            style={{ left: left, width: width, position: 'absolute', backgroundColor: this.props.parent_track.color }}
            onMouseDown={evt => this.set_interacting(evt, 'clip')}
            onMouseUp={evt => this.set_interacting(evt, null)}>
            <div className="left-interaction" onMouseDown={evt => this.set_interacting(evt, 'left')} onMouseUp={evt => this.set_interacting(evt, null)}></div>
            <div className="right-interaction" onMouseDown={evt => this.set_interacting(evt, 'right')} onMouseUp={evt => this.set_interacting(evt, null)}></div>
            <div className="track-clip-meta">{clip_length_str} - {clip_start_str} - {clip_track_str}</div>
            <canvas className="track-clip-canvas" ref={el => this.canvas_el = el} width={width} height='100' />
        </div>);
    }
}