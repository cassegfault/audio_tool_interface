import { AudioTrack } from "lib/AudioInterface";
import { AudioFile } from "lib/common";
import EditorInfo from "lib/AudioInterface/EditorInfo";
export default {
    files: <Array<AudioFile>>([]),
    tracks: <Array<AudioTrack>>([]),
    editorInfo: new EditorInfo()
};