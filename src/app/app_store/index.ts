import Store from "lib/store";
import actions from "app/app_store/actions";
import state from "app/app_store/initial_state";
import mutations from "app/app_store/mutations";

export default new Store({
    actions,
    mutations,
    state
});