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
var app_store = new Store<AppState>({
    actions,
    mutations,
    state
});
window.app_store = app_store;
export { app_store, AppState }