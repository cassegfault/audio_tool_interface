import * as React from "react";
import { app_store, StoreType } from "app/app_store/index";
import { SESSION_TOKEN_KEY } from "utils/symbols";

// This interface will merge with the abstract class definition below
interface BaseRoute {
    authenticate(parameters: { redirect: (path: string) => void }): void;
    activate(parameters: {
        redirect: (path: string) => void,
        params: Map<string, string>,
        url: string
    }): void;

    deactivate(): void;
}
// Page controllers are singletons
abstract class BaseRoute {
    //!- Singleton Logic
    constructor() {
        // To avoid setting the instance on the class directly
        // so that this class may be extended
        var prototype = Object.getPrototypeOf(this);
        // Decide if we're creating an instance or not
        if (prototype._instance) {
            return prototype._instance;
        }
        prototype._instance = this;
    }
    public static getInstance: any = function () {
        return this._instance;
    }
    //-!
    store: StoreType = app_store;
    abstract view: React.Component;
    abstract render(): React.ReactNode;
}

abstract class BaseAuthenticatedRoute extends BaseRoute {
    async authenticate({ redirect }) {
        var token = window.localStorage.getItem(SESSION_TOKEN_KEY);
        if (token) {
            app_store.dispatch("set_session_token", token);
        } else {
            redirect('/login');
            return Promise.resolve()
        }
        if (app_store.state.user.id === undefined) {
            try {
                await app_store.dispatch('initialize_user');
            } catch (e) {
                redirect('/login');
                return Promise.resolve()
            }
        }
        return Promise.resolve();
    }
}

export { BaseRoute, BaseAuthenticatedRoute };