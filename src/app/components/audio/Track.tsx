import * as React from "react";
import { AudioTrack, AudioClip, audioInterface } from "lib/AudioInterface";
import Clip from "./Clip";
import StoreComponent from "lib/StoreComponent";
import { AudioState } from "app/audio_store";

export default class Track extends StoreComponent<AudioState, { track: AudioTrack, editorInfo:any }> {
    constructor(props){
        super(audioInterface.store, props);
        this.add_observer(["tracks.@each.clips.length"], () => {
            console.log("Track rendering")
            this.forceUpdate();
        });
    }

    render(){
        // truncate clips who do not appear in the current window
        const clips = [];
        this.props.track.clips.forEach((clip: AudioClip) => {
            if (clip.start_position + clip.length >= audioInterface.editorInfo.window_start && 
                clip.start_position < audioInterface.editorInfo.window_end) {
                    clips.push(<Clip key={clip.id } clip={ clip } editorInfo={ audioInterface.editorInfo } />);
            }
        });
        return (<div style={{position:'relative', width: '100%', height:12}}>
            { clips }
        </div>)
    }
}