import * as React from "react";
import { Proxied } from "ts-quickstore";
import { audioInterface, AudioTrack } from "lib/AudioInterface";
import TrackControls from "./TrackControls";

export default class TrackList extends React.Component<{ tracks: Proxied<AudioTrack[]>, editorInfo: any }> {
    constructor(props) {
        super(props);
    }

    render() {
        var tracks = this.props.tracks.map((track: Proxied<AudioTrack>) => {
            return (<TrackControls key={track.id} track={track} editorInfo={this.props.editorInfo} />)
        })
        return (<div className="track-list">
            {tracks}
        </div>);
    }
}