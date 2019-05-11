import { Store } from "ts-quickstore";
import actions from "app/app_store/actions";
import state from "app/app_store/initial_state";
import mutations from "app/app_store/mutations";
declare global {
    interface Window {
        app_store: any;
    }
}
type AppState = typeof state;
type ActionTypes = typeof actions;
type MutationTypes = typeof mutations;
type StoreType = Store<AppState, ActionTypes, MutationTypes>;
const app_store: StoreType = new Store<AppState, ActionTypes, MutationTypes>({
    actions,
    mutations,
    state
});
window.app_store = app_store;
export { app_store, AppState, ActionTypes, MutationTypes, StoreType }