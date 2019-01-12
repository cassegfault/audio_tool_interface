import * as React from "react";
import TrackList from "./TrackList";
import { audioInterface } from "lib/AudioInterface";
import { Proxied } from "lib/common";
import StoreComponent from "lib/StoreComponent";
import { AudioState } from "app/audio_store";
import StatusBar from "app/components/audio/StatusBar";
import ClipEditor from "app/components/audio/ClipEditor";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default class TrackEditor extends StoreComponent<AudioState> {
    state: any;
    constructor(props){
        super(audioInterface.store, props);
        this.state = {
            tracks: audioInterface.tracks,
            editorInfo: audioInterface.editorInfo
        }
        this.add_observer(["tracks.length", "tracks.@each.clips.length"], () => {
                var stateObj: any = {
                    tracks: audioInterface.tracks,
                    editorInfo: audioInterface.editorInfo
                };
                if(audioInterface.tracks.length === 1 && 
                    audioInterface.tracks[0].clips.length === 1) {
                    if(audioInterface.editorInfo.window_start === 0 && audioInterface.editorInfo.project_length === 0){
                        var editorInfo = audioInterface.editorInfo as Proxied<EditorInfo>;
                        editorInfo.set_property({ project_length: audioInterface.tracks[0].clips[0].length})
                    }
                }
                this.setState(stateObj);
            });
    }
    
    add_track() {
        audioInterface.store.dispatch("newTrack",{});
    }

    render() {
        console.log("Track Editor Render")
        
        return (<div className="track-editor">
            <StatusBar />
            <div className="track-editor-label-container">
                <div className="tracks-section-header">
                    <div className="tracks-section-header-label">Tracks</div>
                    <div className="tracks-section-header-actions">
                        <button className="icon-button-compact" onClick={evt=>this.add_track()}><i className="mdi mdi-plus"></i></button>
                    </div>
                </div>
                <div className="clip-editor-label"></div>
            </div>
            <div className="track-editor-container">
                <TrackList tracks={this.store.state.tracks} editorInfo={this.state.editorInfo} />
                <ClipEditor />
            </div>
        </div>)
    }
}


