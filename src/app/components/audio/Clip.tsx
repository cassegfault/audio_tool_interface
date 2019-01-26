import * as React from "react";
import { AudioTrack, AudioClip, audioInterface } from "lib/AudioInterface";
import { debug } from "utils/console";
import EditorInfo from "lib/AudioInterface/EditorInfo";
import Interactable from "../helpers/Interactable";
import EventManager from "lib/EventManager";
import StoreComponent from "lib/StoreComponent";
import { AudioState } from "app/audio_store";

export default class Clip extends StoreComponent<AudioState, { clip: Proxied<AudioClip>, editorInfo: EditorInfo, eventManager: EventManager }> {
    state: any;
    parentEl: any;
    left_drag: boolean = false;
    right_drag: boolean = false;

    canvas_el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    left: number;
    width: number;

    constructor(props) {
        super(audioInterface.store, props);
        this.state = { left: 0, width: 0, mouse: 0, interacting: null };
        this.props.eventManager.on('drag', this.update_state.bind(this));
        this.props.eventManager.on('endDrag', this.mouseUp.bind(this));
        var fileIndex = audioInterface.files.findIndex(file => file.id === this.props.clip.file_id);
        console.log("Watching ", `files.${fileIndex}`);
        this.store.add_observer([`files.${fileIndex}`], () => { console.log("updating clip after file change"); this.forceUpdate() });
    }

    componentDidMount() {
        this.ctx = this.canvas_el.getContext('2d');
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
        audioInterface.store.did_update();
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
            clip.set_property({
                track_position: Math.max(evt.initial_clip_data.track_position + delta, 0)
            });
        }
    }

    release() {
        this.left_drag = false;
        this.right_drag = false;
    }

    pixels_to_seconds(pixel_width) {
        return (pixel_width / (this.props.editorInfo.project_length * this.props.editorInfo.window_scale)) * (this.props.editorInfo.project_length);
    }

    update_display(element) {
    }

    set_interacting(evt, interacting: string) {
        evt.stopPropagation()
        if (interacting) {
            this.props.eventManager.fire('beginDrag', { clientX: evt.clientX, initial_clip_data: Object.assign({}, this.props.clip) });
        } else {
            this.props.eventManager.fire('endDrag', { clientX: evt.clientX, initial_clip_data: Object.assign({}, this.props.clip) });
        }
        this.setState({ interacting });
    }

    render() {
        var clip = this.props.clip,
            editorInfo = this.props.editorInfo;

        if (editorInfo.project_length < (clip.track_position + clip.length)) {
            editorInfo.set_window({ project_length: clip.track_position + clip.length });
        }
        var left = (clip.track_position / editorInfo.project_length) * (editorInfo.project_length * editorInfo.window_scale),
            width = (clip.length / editorInfo.project_length) * (editorInfo.project_length * editorInfo.window_scale);

        while (true) {
            var file = audioInterface.files.find((file: AudioFile) => this.props.clip.file_id == file.id);
            console.log('FILE DETAILS', file, this.props.clip.file_id)
            if (!file || !this.ctx) {
                // draw as empty proxy
                console.log("Did not draw clip because there was no file or context", this.ctx, file);
                break;
            }

            var buff = audioInterface.get_file_data(this.props.clip.file_id),
                ctx = this.ctx,
                el = this.canvas_el;
            if (!buff)
                break;
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
            break;
        }

        var clip_length_str = clip.length.toPrecision(2) + 's',
            clip_start_str = clip.start_position.toPrecision(2) + 's',
            clip_track_str = clip.track_position.toPrecision(2) + 's',
            file = audioInterface.files.find((file) => file.id === this.props.clip.file_id),
            file_name = file && file.file.name;
        return (<div className="track-clip"
            style={{ left: left, width: width, position: 'absolute' }}
            onMouseDown={evt => this.set_interacting(evt, 'clip')}>
            <div className="left-interaction" onMouseDown={evt => this.set_interacting(evt, 'left')}></div>
            <div className="right-interaction" onMouseDown={evt => this.set_interacting(evt, 'right')}></div>
            {clip_length_str} - {clip_start_str} - {clip_track_str}
            <canvas ref={el => this.canvas_el = el} width={width} height='100' />
        </div>);
    }
}