import { AudioTrack } from "lib/AudioInterface";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default {
    files: <Array<Proxied<AudioFile>>>([]),
    tracks: <Array<Proxied<AudioTrack>>>([]),
    editorInfo: new EditorInfo(),

    load(obj) {
        if (obj.files) {
            this.files = obj.files;
        }

        if (obj.tracks) {
            this.tracks = obj.tracks.map((track) => new AudioTrack(track));
        }

        if (obj.editorInfo) {
            this.editorInfo.load(obj.editorInfo);
        }
    }
};