import * as React from "react";
import Track from "./Track";
import { audioInterface } from "lib/AudioInterface";

export default class TrackList extends React.Component<{ tracks: any[], editorInfo: any}> {
    constructor(props){
        super(props);
    }

    render() {
        console.log("Tracks Render");
        var tracks = this.props.tracks.map((track)=>{
            return (<Track key={track.id} track={track} editorInfo={this.props.editorInfo} />)
        })
        return (<div>
            {tracks}
        </div>)
    }
}