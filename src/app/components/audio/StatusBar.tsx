import * as React from "react";
import { audioInterface } from "lib/AudioInterface";
import { seconds_to_timestamp } from "utils/helpers";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default class StatusBar extends React.Component {
    state: any;
    scale_input: HTMLInputElement;
    constructor(props) {
        super(props);
        audioInterface.store.add_observer(["editorInfo.current_position", "editorInfo.window_scale"], () => {
            this.forceUpdate();
        })
    }
    set_window_range() {
        var editorInfo = audioInterface.store.state.editorInfo as Proxied<EditorInfo>;

        editorInfo.set_property({
            window_scale: parseFloat(this.scale_input.value)
        });
    }
    download() {
        return new Promise((resolve, reject) => {
            audioInterface.saveMedia();
            resolve();
        });
    }

    render() {
        return (<div className="track-editor-statusbar">
            <div className="statusbar-tools">
                <button className="icon-button-compact"><i className="mdi mdi-cursor-default"></i></button>
                <button className="icon-button-compact" onClick={evt => this.download()}><i className="mdi mdi-scissors-cutting"></i></button>
            </div>
            <div className="statusbar-timestamp">
                {seconds_to_timestamp(audioInterface.editorInfo.current_position)}
            </div>
            <div className="statusbar-zoom">
                <input ref={el => this.scale_input = el} value={audioInterface.editorInfo.window_scale} type="range" min="10" max="1000" style={{ maxWidth: 300 }} onChange={evt => this.set_window_range()} />
            </div>
        </div>);
    }
}