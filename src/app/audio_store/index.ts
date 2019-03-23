import Store from "lib/store";
import actions from "app/audio_store/actions";
import state from "app/audio_store/initial_state";
import mutations from "app/audio_store/mutations";

export type AudioState = typeof state;
type ActTypes = typeof actions;
type MutTypes = typeof mutations;
export type StoreType = Store<AudioState, ActTypes, MutTypes>;
export default new Store<AudioState, ActTypes, MutTypes>({
    actions,
    mutations,
    state
});