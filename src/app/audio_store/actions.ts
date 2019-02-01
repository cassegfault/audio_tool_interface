import { ActionsMap } from "lib/Store";
export default <ActionsMap>{
    addFile({ commit, payload }) {
        commit('addFile', payload);
    },
    removeFile({ commit, payload }) {
        commit('removeFile', payload)
    },
    renameFile({ commit, payload: { name, id } }) {
        commit('renameFile', { name, id });
    },
    newTrack({ commit, payload }) {
        commit('newTrack', payload);
    },
    addClipToTrack({ commit, payload }) {
        commit('addClipToTrack', payload);
    },
    set_window({ commit, payload }) {
        commit('set_window', payload);
    },
    removeClipsFromTrack({ commit, payload }) {
        commit('removeClipsFromTrack', payload);
    }
};