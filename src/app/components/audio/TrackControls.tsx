import * as React from "react";
import { AudioTrack, AudioClip, audioInterface } from "lib/AudioInterface";
import StoreComponent from "lib/StoreComponent";
import { StoreType } from "app/audio_store";

export default class TrackControls extends StoreComponent<StoreType, { track: Proxied<AudioTrack>, editorInfo: any }> {
    gain_input: HTMLInputElement;
    solo_input: HTMLInputElement;
    mute_input: HTMLInputElement;
    constructor(props) {
        super(audioInterface.store, props);
    }

    add_clip() {
        this.props.track.addClipFromFile(this.store.state.files[0].id);
    }

    set_gain() {
        this.props.track.set_property({
            gain: this.gain_input.value
        });
    }

    set_solo() {
        this.props.track.set_property({
            solo: this.solo_input.value
        });
    }

    set_mute() {
        this.props.track.set_property({
            mute: this.mute_input.value
        });
    }

    render() {
        return (<div className="track-controls" style={{ borderLeftColor: this.props.track.color }}>
            <span className="track-controls-label">
                {this.props.track.name}
            </span>
            <input type="checkbox"
                ref={el => this.solo_input = el}
                checked={this.props.track.solo}
                onChange={evt => this.set_solo()}
                className="track-controls-solo" />
            <input type="checkbox"
                ref={el => this.mute_input = el}
                checked={this.props.track.mute}
                onChange={evt => this.set_mute()}
                className="track-controls-mute" />
            <input type="range"
                ref={el => this.gain_input = el}
                className="vertical track-controls-gain"
                min="0" max="3"
                step="any"
                value={this.props.track.gain}
                onChange={evt => this.set_gain()} />
        </div>);
    }
}