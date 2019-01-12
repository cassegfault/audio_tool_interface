import * as React from "react";
import { audioInterface } from "lib/AudioInterface";
import { seconds_to_timestamp } from "utils/helpers";
import { Proxied } from "lib/common";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default class StatusBar extends React.Component {
    state:any;
    scale_input: HTMLInputElement;
    constructor(props) {
        super(props);
        audioInterface.store.add_observer(["editorInfo.current_position"], ()=>{
            this.forceUpdate();
        })
    }
    set_window_range(){
        var editorInfo = audioInterface.store.state.editorInfo as Proxied<EditorInfo>;
        
        editorInfo.set_property({
            window_scale: parseFloat(this.scale_input.value)
        });
    }

    render() {
        return (<div className="track-editor-statusbar">
        <div className="statusbar-tools">
            <button className="icon-button-compact"><i className="mdi mdi-cursor-default"></i></button>
            <button className="icon-button-compact"><i className="mdi mdi-scissors-cutting"></i></button>
        </div>
        <div className="statusbar-timestamp">
            {seconds_to_timestamp(audioInterface.editorInfo.current_position)}
        </div>
        <div className="statusbar-zoom">
            <input ref={el => this.scale_input = el} type="range" min="10" max="100" style={{maxWidth:300}} onChange={evt=>this.set_window_range()} />
        </div>
        </div>);
    }
}