import * as React from "react";
import Requests from "requests";
import { AudioInterface, AudioTrack } from "lib/AudioInterface";
import { AudioFile } from "lib/common";

const audioInterface = AudioInterface.getInstance();
export default class Files extends React.Component {
    state: any;
    constructor(props) {
        super(props);
        this.state = {
            files: []
        };
    }
    uploadFiles(){
        let el = this.refs.file_uploader as HTMLInputElement,
            d = new FormData();

        // Better to do request per file, let them process in parallel
        //for (let i = 0; i < el.files.length; i++) {
        //    let file = el.files[i];
        //    d.append(`file${i}`, file);
        //}

        d.append(`file0`, el.files[0]);
        Requests.post("http://localhost:9090/decode",d, { responseType: "arraybuffer" }).then((arrayBuffer: any)=>{
            audioInterface.loadFile(arrayBuffer, el.files[0]).then((files) => { console.log('then',files); this.forceUpdate(); } );
        }).catch((xhr) => {
            console.error("Couldn't reach API", xhr);
        });
    }

    removeItem(index) { 
        audioInterface.dereferenceFile(index);
        this.forceUpdate();
    }
    undo(){
        audioInterface.undo();
        this.forceUpdate();
    }
    redo(){
        audioInterface.redo();
        this.forceUpdate();
    }
    renameFile(id){
        audioInterface.renameFile(id,"MY NEW NAME");
        this.forceUpdate();
    }
    addTrack(){
        audioInterface.store.dispatch("newTrack","asdf");
        this.forceUpdate();
    }
    addClip(){
        var file_id = audioInterface.files && audioInterface.files[0].id,
            track_id = audioInterface.tracks && audioInterface.tracks[0].id;
        audioInterface.store.dispatch("addClipToTrack", {track_id, file_id})
        this.forceUpdate();
    }
    render() {
        const files = audioInterface.files && audioInterface.files.map((file: AudioFile, idx)=>{
            return (<li key={file.id}>
            <span>{file.file.name}</span>
            <span style={{marginLeft:20}} onClick={evt => this.renameFile(file.id)}>e</span>
            <span style={{marginLeft:20}} onClick={evt => this.removeItem(file.id)}>x</span>
            </li>);
        });
        console.log('render',audioInterface.files)
        return (<div>
            <ul>
                {files}
            </ul>
            <div>
                <input type="file" ref="file_uploader" />
                <button onClick={evt=>this.uploadFiles()}>Upload</button>
                <button onClick={evt=>this.undo()}>Undo</button>
                <button onClick={evt=>this.redo()}>Redo</button>
                <button onClick={evt=>this.addTrack()}>Add Track</button>
                <button onClick={evt=>this.addClip()}>Add Clip</button>
            </div>
        </div>)
    }
}