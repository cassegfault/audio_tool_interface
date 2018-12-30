import * as React from "react";
import TrackList from "./TrackList";
import { audioInterface } from "lib/AudioInterface";
import StoreComponent from "lib/StoreComponent";
import { AudioState } from "app/audio_store";

export default class TrackEditor extends StoreComponent<AudioState> {
    state: any;
    constructor(props){
        super(audioInterface.store, props);
        this.state = {
            tracks: audioInterface.tracks,
            editorInfo: audioInterface.editorInfo
        }
        this.add_observer(["tracks.length", "tracks.@each.clips.length"], () => {
                console.log("track editor state chagned");
                var stateObj: any = {
                    tracks: audioInterface.tracks,
                    editorInfo: audioInterface.editorInfo
                };
                console.log(`TRACKS ${audioInterface.tracks.length} CLIPS ${audioInterface.tracks[0] && audioInterface.tracks[0].clips.length}`);
                if(audioInterface.tracks.length === 1 && 
                    audioInterface.tracks[0].clips.length === 1) {
                        console.log("Single track, single clip", audioInterface.editorInfo);
                    if(audioInterface.editorInfo.window_start === 0 && audioInterface.editorInfo.window_end === 1){
                        console.log("Update window for single clip")
                        //stateObj.window_end = audioInterface.tracks[0].clips[0].length;
                        audioInterface.editorInfo.set_window({ window_end: audioInterface.tracks[0].clips[0].length})
                    }
                }
                this.setState(stateObj);
            });
    }
    
    render() {
        console.log("Track Editor Render")
        return (<div>
            <TrackList tracks={this.state.tracks} editorInfo={this.state.editorInfo} />
        </div>)
    }
}


