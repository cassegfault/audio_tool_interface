import { extend } from "utils/helpers";
import { debug } from "utils/console";
import { MutationsMap } from "ts-quickstore";

export default <MutationsMap>{
    set_user({ state, payload: { session_token, email_address, id } }) {
        debug("Set user");
        /*state.user = extend(state.user, {
            session_token,
            email_address,
            id
        });*/
        state.user.session_token = session_token;
        state.user.email_address = email_address;
        state.user.id = id;
    }
}