import { MutationsMap } from "lib/Store";
import { AudioFile } from "lib/common";
import { warn } from "utils/console";
import { AudioTrack, AudioClip } from "lib/AudioInterface";
import { make_guid } from "utils/helpers";
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
        state.tracks.push(new AudioTrack(make_guid()));
    },
    addClipToTrack({ state, payload: { track_id, file_id} }) {
        var foundTrack:AudioTrack = state.tracks.find((file:AudioFile) => file.id === track_id);
        if(!foundTrack){
            return warn(`Could not find track: ${track_id}`);
        }
        console.log(`adding clip from file ${file_id} to track ${track_id}`, track_id);
        foundTrack.clips.push(new AudioClip(file_id));
    },
    set_window({ state, payload}) {
        Object.keys(payload).forEach((key)=>{
            state.editorInfo[key] = payload[key];
        });
        console.log('window set', state.editorInfo);
    }
}