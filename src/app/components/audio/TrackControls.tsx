import * as React from "react";
import { AudioTrack, AudioClip, audioInterface } from "lib/AudioInterface";
import StoreComponent from "lib/StoreComponent";
import { AudioState } from "app/audio_store";

export default class TrackControls extends StoreComponent<AudioState, { track: AudioTrack, editorInfo:any }> {
    constructor(props){
        super(audioInterface.store, props);
    }

    add_clip(){
        this.props.track.addClipFromFile(this.store.state.files[0].id);
    }

    render(){
        return (<div className="track-controls" style={{borderLeftColor:this.props.track.color}}>
                    { this.props.track.name }
                </div>);
    }
}