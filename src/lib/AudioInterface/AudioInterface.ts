import { make_guid } from "utils/helpers";
import Store from "../Store";
import audio_store, {AudioState} from "app/audio_store";
import { AudioFile } from "../common"
import AudioTrack from "./AudioTrack";
import EditorInfo from "./EditorInfo";
declare global {
    interface Window { audioInterface: any; }
}

class AudioInterface {
    //!- singleton logic
    private static _instance: AudioInterface = new AudioInterface();
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
                                length: audioBuffer.length
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
        var id = make_guid();
        this.store.dispatch('newTrack', id);
    }
}

/** AudioInterface instance for cleaner imports */
const audioInterface = AudioInterface.getInstance();

export { AudioInterface, audioInterface };