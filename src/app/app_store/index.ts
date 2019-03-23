import Store from "lib/store";
import actions from "app/app_store/actions";
import state from "app/app_store/initial_state";
import mutations from "app/app_store/mutations";
declare global {
    interface Window {
        app_store: any;
    }
}
type AppState = typeof state;
type ActTypes = typeof actions;
type MutTypes = typeof mutations;
type StoreType = Store<AppState, ActTypes, MutTypes>;
var app_store = new Store<AppState, ActTypes, MutTypes>({
    actions,
    mutations,
    state
});
window.app_store = app_store;
export { app_store, StoreType }