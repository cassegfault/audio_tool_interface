import { MutationsMap } from "ts-quickstore";
import { warn } from "utils/console";
import { AudioTrack, AudioClip } from "lib/AudioInterface";
import { make_guid } from "utils/helpers";
import { ColorBlindFriendly } from "static_data/colors";
export default <MutationsMap>{
    addFile({ state, payload }) {
        // Check payload here
        state.files.push(payload);
    },
    removeFile({ state, payload: id }) {
        var foundFileIndex = -1,
            foundFile = state.files.find((file: AudioFile, index) => {
                if (file.id === id) {
                    foundFileIndex = index;
                    return true;
                }
                return false
            });
        if (!foundFile) {
            return warn(`Could not find file: ${id}`);
        }
        state.files.splice(foundFileIndex, 1);
    },
    renameFile({ state, payload: { name, id } }) {
        var foundFile = state.files.find((file: AudioFile) => file.id === id);
        if (!foundFile) {
            return warn(`Could not find file: ${id}`);
        }
        foundFile.file.name = name;
    },
    newTrack({ state }) {
        var colorIndex = state.tracks.length % ColorBlindFriendly.length;
        state.tracks.push(new AudioTrack({
            id: make_guid(),
            name: `Track ${state.tracks.length + 1}`,
            color: ColorBlindFriendly[colorIndex]
        }));
    },
    addClipToTrack({ state, payload: { track_id, file_id } }) {
        var foundTrack: AudioTrack = state.tracks.find((track: AudioTrack) => track.id === track_id);
        if (!foundTrack) {
            return warn(`Could not find track: ${track_id}`);
        }
        foundTrack.clips.push(new AudioClip({ file_id }));
    },
    set_window({ state, payload }) {
        Object.keys(payload).forEach((key) => {
            state.editorInfo[key] = payload[key];
        });
    },
    removeClipsFromTrack({ state, payload: { track_id, clips } }) {
        var foundTrack: AudioTrack = state.tracks.find((track: AudioTrack) => track.id === track_id);
        if (!foundTrack) {
            return warn(`Could not find track: ${track_id}`);
        }
        var new_clips = [].concat(foundTrack.clips);
        clips.forEach((clip_idx) => {
            new_clips.splice(clip_idx, 1);
        });
        foundTrack.clips = new_clips;
    }
}