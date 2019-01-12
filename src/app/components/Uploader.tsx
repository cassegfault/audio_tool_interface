
import * as React from "react";

import Requests from "requests";
import { AudioView } from "app/components/AudioView";

interface UploaderState {
    ctx: AudioContext,
    buffer: AudioBuffer,
    numbins: number,
    files: FileList
}

export class Uploader extends React.Component<object, UploaderState> {
    readonly state: UploaderState = {
        ctx: null,
        buffer: null,
        numbins: 500,
        files: null
    }

    componentDidMount(){
        
        this.setState({
            ctx: new AudioContext()
        });
    }

    changeBins(evt: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            numbins: parseInt((evt.target as HTMLInputElement).value)
        });
    }
    setFiles(evt: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            files: (evt.target as HTMLInputElement).files
        });
    }

    initAudio(buffer: AudioBuffer) {
        this.setState({ buffer });
        //var source = this.ctx.createBufferSource();
        //source.buffer = this.buffer;
        //source.connect(this.ctx.destination);
        //source.start(0);
    }

    uploadFile(){
        let d = new FormData();
        for (let i = 0; i < this.state.files.length; i++) {
            let file = this.state.files[i];
    
            d.append(`file${i}`, file);
        }
        console.log(d);
        Requests.post("http://localhost:9095/decode",d, { responseType: "arraybuffer" }).then((arrayBuffer: any)=>{
            this.state.ctx.decodeAudioData(arrayBuffer, this.initAudio.bind(this));
        }).catch((xhr)=>{
            console.error("Couldn't reach API", xhr);
        });
    
    }

    render() {
        return (<div>
                    <input type="file" name="audio-file-upload" ref="file_upload" accept=".mp3,.aac,.wav" onChange={evt => this.setFiles(evt)}></input>
                    <button onClick={this.uploadFile.bind(this)}>Upload</button>
                    <input type="range" min="1" max="1000" ref="numbins" value={this.state.numbins} onChange={evt => this.changeBins(evt)}></input>
                    <AudioView audioctx={this.state.ctx} numbins={this.state.numbins} buffer={this.state.buffer}></AudioView>
                </div>);
    }
}
