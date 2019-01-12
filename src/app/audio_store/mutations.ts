import { MutationsMap } from "lib/Store";
import { AudioFile } from "lib/common";
import { warn } from "utils/console";
import { AudioTrack, AudioClip } from "lib/AudioInterface";
import { make_guid } from "utils/helpers";
import { ColorBlindFriendly } from "static_data/colors";
import { Proxied } from "lib/common";
export default <MutationsMap>{
    addFile({state, payload}){
        // Check payload here
        state.files.push(payload );
    },
    removeFile({state, payload: id}){
        var foundFileIndex = -1,
            foundFile = state.files.find((file:AudioFile, index) => {
            if(file.id === id){
                foundFileIndex = index;
                return true;
            }
            return false
        });
        if(!foundFile){
            return warn(`Could not find file: ${id}`);
        }
        state.files.splice(foundFileIndex,1);
    },
    renameFile({state, payload: {name, id}}) {
        var foundFile = state.files.find((file:AudioFile) => file.id === id);
        if(!foundFile){
            return warn(`Could not find file: ${id}`);
        }
        foundFile.file.name = name;
    },
    newTrack({state }) {
        var colorIndex =  state.tracks.length % ColorBlindFriendly.length;
        state.tracks.push(new AudioTrack(make_guid(), `Track ${state.tracks.length + 1}`, ColorBlindFriendly[colorIndex]));
    },
    addClipToTrack({ state, payload: { track_id, file_id} }) {
        var foundTrack:AudioTrack = state.tracks.find((track:AudioTrack) => track.id === track_id);
        if(!foundTrack){
            return warn(`Could not find track: ${track_id}`);
        }
        foundTrack.clips.push(<Proxied<AudioClip>>(new AudioClip(file_id)));
    },
    set_window({ state, payload}) {
        Object.keys(payload).forEach((key)=>{
            state.editorInfo[key] = payload[key];
        });
    },
    set_property({ state, payload: { value_object, path }}){
        var current = state;
        path.forEach((part) => {
            current = current[part];
        });
        Object.keys(value_object).forEach((key)=>{
            current[key] = value_object[key];
        });
    }
}