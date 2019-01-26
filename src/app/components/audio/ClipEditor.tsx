import * as React from "react";
import StoreComponent from "lib/StoreComponent";
import { audioInterface, AudioClip, AudioTrack } from "lib/AudioInterface";
import { AudioState } from "app/audio_store";
import Clip from "./Clip";
import { log } from "utils/console";
import Interactable from "../helpers/Interactable";
import EventManager from "lib/EventManager";
import MarkerViewport from "./MarkerViewport";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default class ClipEditor extends StoreComponent<AudioState> {
    state: any;
    events: EventManager = new EventManager();
    editorRef: React.RefObject<HTMLDivElement>;
    constructor(props) {
        super(audioInterface.store, props);
        this.add_observer(["tracks.length", "tracks.@each.clips.length", "editorInfo.project_length", "editorInfo.window_scale"], () => { this.forceUpdate(); });
        this.state = {
            is_interacting: false,
            interactionInfo: { callback: () => { } }
        };
        this.events.on('beginDrag', (evt) => { console.log('begin'); this.begin_drag(evt) });
        this.events.on('endDrag', (evt) => { this.end_drag(evt) });
        this.editorRef = React.createRef<HTMLDivElement>();
    }

    get interactions() {
        var is_dragging = false,
            startX = -1,
            mouseStartX = -1;
        return {
            click(evt, clip) {

            },
            mouseDown(evt, clip: Proxied<AudioClip>) {
                //log('mouseDown');
                is_dragging = true;
                mouseStartX = evt && evt.clientX;
                startX = clip.track_position;
            },
            mouseUp(evt, clip: Proxied<AudioClip>) {
                //log('mouseUp');
                is_dragging = false;
            },
            mouseMove(evt, clip: Proxied<AudioClip>) {
                //log('mouseMove');

            }
        }
    }

    mouseDown(evt) { }
    mouseUp(evt) {
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

    render() {
        const tracks = this.store.state.tracks.map((track: AudioTrack) => {
            const clips = track.clips.map((clip) => {
                return (<Clip
                    key={clip.id}
                    clip={clip}
                    editorInfo={audioInterface.editorInfo}
                    eventManager={this.events}
                />);
            });
            return (<div key={track.id}
                className="clip-editor-track"
                onDrop={evt => this.trackDropHandler(evt, track)}
                onDragOver={evt => this.trackDragOverHandler(evt, track)}>
                {clips}
            </div>);
        });
        var editorWidth = this.store.state.editorInfo.project_length * this.store.state.editorInfo.window_scale;

        const interaction = this.state.is_interacting ? <Interactable eventManager={this.events} mouseDownCallback={evt => this.mouseDown(evt)} mouseUpCallback={evt => this.mouseUp(evt)} mouseMoveCallback={evt => this.mouseMove(evt)} /> : null;

        return (<div className="clip-editor"
            ref={this.editorRef}
            onDragOver={evt => this.dragOverHandler(evt)}
            onDrop={evt => this.dropHandler(evt)}>
            <MarkerViewport editor={this.editorRef} />
            <div style={{ minWidth: '100%', width: editorWidth, position: 'relative' }}>
                {tracks}
            </div>
            {interaction}
        </div>);
    }
}