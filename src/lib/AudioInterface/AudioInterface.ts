import { make_guid } from "utils/helpers";
import { error } from "utils/console";
import Store from "../Store";
import audio_store, {AudioState} from "app/audio_store";
import { AudioFile } from "../common"
import AudioTrack from "./AudioTrack";
import EditorInfo from "./EditorInfo";
import Requests from "requests";
declare global {
    interface Window { audioInterface: any; }
}

class AudioInterface {
    //!- singleton logic
    private static _instance: AudioInterface = new AudioInterface();
    private _audio_nodes: AudioBufferSourceNode[] = [];
    private constructor() {
        // Decide if we're creating an instance or not
        if(AudioInterface._instance) {
            return AudioInterface._instance;
        } 
        AudioInterface._instance = this;
    }
    public static getInstance(){
        return AudioInterface._instance;
    }
    //-!
    
    store: Store<AudioState> = audio_store;

    private ctx = new AudioContext();
    private audioMap: Map<string,AudioBuffer> = new Map();

    public get files(): AudioFile[] {
        return this.store.state.files;
    }

    get_file_data(file_id: string){
        return this.audioMap.get(file_id);
    }
    
    public get tracks(): AudioTrack[] {
        debugger;
        return this.store.state.tracks;
    }

    public get editorInfo(): EditorInfo {
        debugger;
        return this.store.state.editorInfo;
    }

    undo() {
        this.store.undo();
    }

    redo() {
        this.store.redo();
    }

    upload_with_dialog(){
        return new Promise((resolve,reject) => {
            var el = document.createElement("input");
            el.type = "file";
            el.onchange = () => {
                var d = new FormData();
                d.append(`file0`, el.files[0]);
                Requests.post("http://localhost:9095/decode",d, { responseType: "arraybuffer" }).then((arrayBuffer: any)=>{
                    audioInterface.loadFile(arrayBuffer, el.files[0]).then((files) => { resolve(); } );
                }).catch((xhr) => {
                    error("Couldn't reach API", xhr);
                    reject();
                });
            }
            el.click();
        });
    }

    loadFile(buf: ArrayBuffer, file?: File) {
        return new Promise((resolve,reject)=>{
            try {
                this.ctx.decodeAudioData(buf, (audioBuffer: AudioBuffer) => {
                    var id = make_guid();
                    this.audioMap.set(id, audioBuffer);
                    this.store.dispatch('addFile', {
                            id: id, // this should be given to us by the server after storage
                            file: {
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                lastModified: file.lastModified,
                                length: audioBuffer.length,
                                sample_rate: audioBuffer.sampleRate
                            }
                        });
                    resolve(this.store.state.files)
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    dereferenceFile(id: string){
        this.store.dispatch('removeFile', id);
    }
    
    renameFile(id:string, name:string) {
        this.store.dispatch('renameFile',{id,name});
    }

    addTrack(){
        this.store.dispatch('newTrack', {});
    }

    play(){
        this.tracks.forEach((track)=>{
            var track_gain = new GainNode(this.ctx);
            track.clips.forEach((clip)=>{
                var newNode = new AudioBufferSourceNode(this.ctx, {buffer:this.audioMap.get(clip.file_id)})
                this._audio_nodes.push(newNode);
                newNode.connect(track_gain);
                newNode.start(this.ctx.currentTime + clip.start_position, 0, clip.length);
            });
            track_gain.connect(this.ctx.destination);
        });
    }
    
    stop(){
        this._audio_nodes.forEach((node) => node.stop());
    }
}

/** AudioInterface instance for cleaner imports */
const audioInterface = AudioInterface.getInstance();

export { AudioInterface, audioInterface };