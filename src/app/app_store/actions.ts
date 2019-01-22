import Requests from "requests";
import { SESSION_TOKEN_KEY } from "utils/symbols";

export default {
    set_session_token({ commit, payload: session_token }){
        window.localStorage.setItem(SESSION_TOKEN_KEY, session_token);
        commit('set_user', { session_token });
    },
    async initialize_user({ commit, dispatch, payload: user }){
        if (user && user.session_token) {
            dispatch('set_session_token', user.session_token);
        } else {
            var token = window.localStorage.getItem(SESSION_TOKEN_KEY);
            commit('set_user', { session_token: token });
        }
        try {
            var { output, error_message } = await Requests.get("user");
        } catch (error) {
            return Promise.reject(error);
        }
        if (error_message) {
            return Promise.reject(error_message);
        }
        commit('set_user', output);
        Promise.resolve();
    }
};