import { Store } from "ts-quickstore";
import actions from "app/audio_store/actions";
import state from "app/audio_store/initial_state";
import mutations from "app/audio_store/mutations";

type AudioState = typeof state;
type ActTypes = typeof actions;
type MutTypes = typeof mutations;
type StoreType = Store<AudioState, ActTypes, MutTypes>;
const audio_store: StoreType = new Store<AudioState, ActTypes, MutTypes>({
    actions,
    mutations,
    state
});
export { AudioState, StoreType, audio_store }