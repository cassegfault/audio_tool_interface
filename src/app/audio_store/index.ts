import Store from "lib/store";
import actions from "app/audio_store/actions";
import state from "app/audio_store/initial_state";
import mutations from "app/audio_store/mutations";
export type AudioState = typeof state;
export default new Store<AudioState>({
    actions,
    mutations,
    state
});