import { audioInterface } from "./index";
import AudioClip from "./AudioClip";


export default class AudioTrack {
    public clips: Array<AudioClip> = [];
    public id: string;
    constructor(id: string){
        this.id = id;
    }

    addClipFromFile(file_id: string) {
        audioInterface.store.dispatch('addClipToTrack', { track_id: this.id, file_id })
    }
}