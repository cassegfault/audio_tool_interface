import * as React from "react";
import { AudioTrack, AudioClip } from "lib/AudioInterface";

export default class Clip extends React.Component<{ clip: AudioClip, editorInfo: any}> {
    state: any;
    parentEl: any;
    left_drag: boolean = false;
    right_drag: boolean = false;
    constructor(props){
        super(props);
        this.state = { left: 0, width:0  };
    }
    leftClicked(evt){
        this.left_drag = true;
    }
    rightClicked(evt){
        this.right_drag = true
    }
    mouseMove(evt){

    }

    release(){
        this.left_drag = false;
        this.right_drag =false;
    }
    updatePosition(element){
        if(element && !this.parentEl) {
            this.parentEl = element.parentNode;
        }
        var bounds = this.parentEl.getBoundingClientRect(),
            left = (this.props.clip.start_position - this.props.editorInfo.window_start) * (bounds.width / (this.props.editorInfo.window_end - this.props.editorInfo.window_start)),
            width = (this.props.clip.length / (this.props.editorInfo.window_end - this.props.editorInfo.window_start)) * bounds.width;
        
        if (left !== this.state.left || width !== this.state.width){
            this.setState({
                left,
                width
            });
        }
    }
    render() {
        return (<div ref={this.updatePosition.bind(this)} style={{left: this.state.left, width: this.state.width, position:'absolute', height:"100%"}} onMouseUpCapture={evt=>this.release()} onMouseMoveCapture={evt=>this.mouseMove(evt)}>
            <div style={{float:'left',width:10, height:12, background:'grey'}} onClick={evt=>this.leftClicked(evt)}></div>
            <div style={{float:'right',width:10, height:12, background:'grey'}} onClick={evt=>this.rightClicked(evt)}></div>
            </div>)
    }
}