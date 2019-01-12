import { AudioTrack } from "lib/AudioInterface";
import { AudioFile, Proxied } from "lib/common";
import EditorInfo from "lib/AudioInterface/EditorInfo";

export default {
    files: <Array< Proxied<AudioFile> >>([]),
    tracks: <Array< Proxied<AudioTrack> >>([]),
    editorInfo: new EditorInfo()
};