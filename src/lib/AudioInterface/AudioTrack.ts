import { audioInterface } from "./index";
import AudioClip from "./AudioClip";
import { make_guid } from "utils/helpers";


export default class AudioTrack {
    public clips: Array<Proxied<AudioClip>> = [];
    public id: string;
    public name: string;
    public color: string;
    constructor(id: string, name?: string, color?: string) {
        this.id = make_guid();
        this.name = name;
        this.color = color;
    }

    addClipFromFile(file_id: string) {
        audioInterface.store.dispatch('addClipToTrack', { track_id: this.id, file_id })
    }
}