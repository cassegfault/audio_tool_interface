import { AudioTrack } from "lib/AudioInterface";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default {
    files: <Array<Proxied<AudioFile>>>([]),
    tracks: <Array<Proxied<AudioTrack>>>([]),
    editorInfo: new EditorInfo()
};