import * as React from "react";
import { Proxied } from "ts-quickstore";
import StoreComponent from "lib/StoreComponent";
import { audioInterface, AudioClip, AudioTrack } from "lib/AudioInterface";
import { audio_store, StoreType } from "app/audio_store";
import Clip from "./Clip";
import { log, debug } from "utils/console";
import Interactable from "../helpers/Interactable";
import EventManager from "lib/EventManager";
import MarkerViewport from "./MarkerViewport";
import EditorInfo from "lib/AudioInterface/EditorInfo";
import { pixels_to_seconds } from "utils/helpers";

interface ClipEditorState {
    is_interacting: boolean,
    is_selecting: boolean,
    initial_selection: {
        x: number,
        y: number,
        pageX: number,
        pageY: number
    },
    selection_window: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    interactionInfo: { callback: () => void; }
}

interface ClipEditorProps {
    scrollXContainer: React.RefObject<HTMLDivElement>,
    scrollYContainer: React.RefObject<HTMLDivElement>
}
export default class ClipEditor extends StoreComponent<StoreType, ClipEditorProps, ClipEditorState> {
    state: ClipEditorState;
    events: EventManager = new EventManager();
    editorRef: React.RefObject<HTMLDivElement>;
    clipContainerRef: React.RefObject<HTMLDivElement>;
    clipSizingRef: HTMLDivElement;
    constructor(props) {
        super(audioInterface.store, props);
        var clipEditorObserver = () => { console.log("Editor was forced to update"); this.buildTracks(); this.forceUpdate(); };
        this.add_observer(["tracks.length", "tracks.@each.clips.length", "editorInfo.project_length", "editorInfo.window_scale"], clipEditorObserver);
        this.state = {
            is_interacting: false,
            is_selecting: false,
            initial_selection: null,
            selection_window: null,
            interactionInfo: { callback: () => { } }
        };
        this.events.on('beginDrag', (evt) => { this.begin_drag(evt) });
        this.events.on('endDrag', (evt) => { this.end_drag(evt) });
        this.editorRef = React.createRef<HTMLDivElement>();
        this.clipContainerRef = React.createRef<HTMLDivElement>();
    }

    mouseDown(evt) { }

    mouseUp(evt) {
        console.log("mouseup fired");
        this.events.fire('endDrag');
    }
    mouseMove(evt) {
        this.update_interaction_info({ clientX: evt.clientX });
        this.events.fire('drag', this.state.interactionInfo);
    }
    update_interaction_info(params) {
        this.setState({
            interactionInfo: Object.assign(this.state.interactionInfo, params)
        });
    }

    begin_drag(evt) {
        this.setState({ is_interacting: true });
        this.update_interaction_info({ start_x: evt.clientX, initial_clip_data: evt.initial_clip_data });
    }

    end_drag(evt) {
        this.setState({ is_interacting: false });
    }
    dragOverHandler(evt: React.DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = 'copy';
    }
    dropHandler(evt: React.DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        var file_id = evt.dataTransfer.getData('text/plain');
        audioInterface.addTrack();
        var track = audioInterface.tracks[audioInterface.tracks.length - 1];
        track.addClipFromFile(file_id);
    }
    trackDragOverHandler(evt: React.DragEvent, track: AudioTrack) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = 'copy';
    }
    trackDropHandler(evt: React.DragEvent, track: AudioTrack) {
        evt.preventDefault();
        evt.stopPropagation();
        var file_id = evt.dataTransfer.getData('text/plain');
        track.addClipFromFile(file_id);
    }

    selection_start(event) {
        var x = (event.nativeEvent.pageX - this.props.scrollXContainer.current.offsetLeft) + this.editorRef.current.scrollLeft,
            y = (event.nativeEvent.pageY - this.props.scrollXContainer.current.offsetTop) + this.props.scrollYContainer.current.scrollTop;
        this.setState({
            is_selecting: true,
            initial_selection: {
                x,
                y,
                pageX: event.nativeEvent.pageX,
                pageY: event.nativeEvent.pageY
            },
            selection_window: {
                x,
                y,
                width: 0,
                height: 0
            }
        })
    }

    selection_update(event) {
        if (!this.state.initial_selection)
            return;

        var x = (event.nativeEvent.pageX - this.props.scrollXContainer.current.offsetLeft) + this.editorRef.current.scrollLeft,
            y = (event.nativeEvent.pageY - this.props.scrollXContainer.current.offsetTop) + this.props.scrollYContainer.current.scrollTop,
            selection = {
                x: Math.min(x, this.state.initial_selection.x),
                y: Math.min(y, this.state.initial_selection.y),
                width: Math.abs(x - this.state.initial_selection.x),
                height: Math.abs(y - this.state.initial_selection.y)
            },
            tracks = this.store.state.tracks,
            selection_start = pixels_to_seconds(selection.x, this.store.state.editorInfo.project_length, this.store.state.editorInfo.window_scale),
            selection_end = pixels_to_seconds(selection.x + selection.width, this.store.state.editorInfo.project_length, this.store.state.editorInfo.window_scale),
            track_height = this.clipSizingRef.offsetHeight,
            first_track_idx = Math.min(Math.floor(selection.y / track_height), tracks.length - 1),
            last_track_idx = Math.min(Math.floor((selection.y + selection.height) / track_height), tracks.length - 1),
            track_selections: Array<Array<number>> = [];
        for (let tidx = first_track_idx; tidx <= last_track_idx; tidx++) {
            track_selections[tidx] = [];
            tracks[tidx].clips.forEach((clip, idx) => {
                if (clip.track_position + clip.length > selection_start && clip.track_position < selection_end) {
                    track_selections[tidx].push(idx);
                }
            });
        }

        this.setState({
            selection_window: selection
        });
        var editorInfoSelection = audioInterface.editorInfo.selection;
        editorInfoSelection.track_selections.set_property(track_selections);
    }

    selection_end(event) {
        if (this.state.selection_window) {
            var deltaX = Math.abs(event.nativeEvent.pageX - this.state.initial_selection.pageX),
                deltaY = Math.abs(event.nativeEvent.pageY - this.state.initial_selection.pageY);
            if (deltaX < 10 || deltaY < 10) {
                audioInterface.editorInfo.selection.track_selections.set_property([]);
                audioInterface.editorInfo.set_window({
                    current_position: pixels_to_seconds((event.nativeEvent.pageX - this.props.scrollXContainer.current.offsetLeft) + this.editorRef.current.scrollLeft, audioInterface.editorInfo.project_length, audioInterface.editorInfo.window_scale)
                });

                this.setState({
                    selection_window: null
                });
            }

            this.setState({
                is_selecting: false,
                initial_selection: null
            });
            this.buildTracks();
        }
    }

    drag_callback(moved_clip, evt, delta) {
        if (audioInterface.editorInfo.selection.track_selections.length > 0) {
            audioInterface.editorInfo.selection.track_selections.forEach((clips, track_idx) => {
                clips.forEach((clip_idx, clip_idx_idx) => {
                    var clip = audioInterface.tracks[track_idx].clips[clip_idx];
                    clip.set_property({
                        track_position: Math.max(evt.initial_clip_data[track_idx][clip_idx_idx].track_position + delta, 0)
                    });
                })
            })
        } else {
            moved_clip.set_property({
                track_position: Math.max(evt.initial_clip_data.track_position + delta, 0)
            });
        }
    }
    tracks: any = null;
    buildTracks() {
        this.tracks = this.store.state.tracks.map((track: Proxied<AudioTrack>, tidx) => {
            const clips = track.clips.map((clip: Proxied<AudioClip>, cidx) => {
                let is_selected = false;
                if (audioInterface.editorInfo.selection.track_selections[tidx] &&
                    audioInterface.editorInfo.selection.track_selections[tidx].includes(cidx)) {
                    is_selected = true;
                }
                return (<Clip
                    key={clip.id}
                    clip={clip}
                    parent_track={track}
                    editorInfo={audioInterface.editorInfo}
                    eventManager={this.events}
                    is_selected={is_selected}
                    drag_callback={this.drag_callback}
                    selection_start={is_selected ? this.state.selection_window.x : null}
                />);
            });
            return (<div key={track.id}
                className="clip-editor-track"
                ref={(el: HTMLDivElement) => { if (!this.clipSizingRef) this.clipSizingRef = el; }}
                onDrop={evt => this.trackDropHandler(evt, track)}
                onDragOver={evt => this.trackDragOverHandler(evt, track)}>
                {clips}
            </div>);
        });
    }
    render() {
        console.log("editor rendered")
        if (!this.tracks) {
            this.buildTracks();
        }
        const tracks = this.tracks;
        var editorWidth = this.store.state.editorInfo.project_length * this.store.state.editorInfo.window_scale;

        const interaction = this.state.is_interacting ? <Interactable eventManager={this.events} mouseDownCallback={evt => this.mouseDown(evt)} mouseUpCallback={evt => this.mouseUp(evt)} mouseMoveCallback={evt => this.mouseMove(evt)} /> : null;
        const selection = this.state.selection_window && this.state.is_selecting ?
            (<div
                className="clip-editor-selection"
                style={{
                    left: this.state.selection_window.x,
                    top: this.state.selection_window.y,
                    width: this.state.selection_window.width,
                    height: this.state.selection_window.height
                }}
            ></div>)
            : null;

        return (<div className="clip-editor"
            ref={this.editorRef}
            onMouseDown={evt => this.selection_start(evt)}
            onMouseMove={evt => this.selection_update(evt)}
            onMouseUp={evt => this.selection_end(evt)}
            onDragOver={evt => this.dragOverHandler(evt)}
            onDrop={evt => this.dropHandler(evt)}>
            <MarkerViewport editor={this.editorRef} />
            <div
                style={{ minWidth: '100%', width: editorWidth, position: 'relative' }}
                ref={this.clipContainerRef}>
                {tracks}
                {selection}
            </div>
            {interaction}

        </div>);
    }
}