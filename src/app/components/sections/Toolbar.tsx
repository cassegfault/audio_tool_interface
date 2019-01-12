import * as React from "react";
import { audioInterface } from "lib/AudioInterface";

export default class Toolbar extends React.Component {
    state:any;
    menus: any;
    constructor(props: any){
        super(props);
        
    }

    play(){
        audioInterface.play();
    }
    stop(){
        audioInterface.stop();
    }

    render() {
        return (<div className="toolbar">
                    <div className="toolbar-left-section">
                        <button className="icon-button-large"><i className="mdi mdi-arrow-down"></i></button>
                        <button className="icon-button-large"><i className="mdi mdi-arrow-down"></i></button>
                    </div>
                    <div className="toolbar-center-section">
                        <div className="multi-icon-button">
                            <button className="multi-icon-button-item" onClick={evt=>this.play()}><i className="mdi mdi-play"></i></button>
                            <button className="multi-icon-button-item" onClick={evt=>this.stop()}><i className="mdi mdi-stop"></i></button>
                            <button className="multi-icon-button-item"><i className="mdi mdi-record"></i></button>
                        </div>
                    </div>
                    <div className="toolbar-right-section">
                    </div>
                </div>)
    }
}