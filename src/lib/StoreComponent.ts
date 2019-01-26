import * as React from "react";
import Store from "./Store";

/** Class for components who make use of some Store
 * Requires `_store` be passed in the constructor and `super.componentWillUnmount` to be called in `componentWillUnmount` if it is overridden
 */
export default class StoreComponent<StoreType extends object, P = {}, S = {}> extends React.Component<P, S> {
    private _observers: string[] = [];
    private _store: Store<StoreType>;
    constructor(store: Store<StoreType>, props) {
        super(props);
        this._store = store;
    }
    get store() {
        return this._store;
    }

    /** Observe a path or set of paths on the store and fire a callback when they change
     * @param to_watch Path or paths relative to the store to watch
     * @param callback Function to be called when any of the paths change
     */
    add_observer(to_watch: string | string[], callback: (...args) => void) {
        var handler_id = this._store.add_observer(to_watch, callback);
        this._observers.push(handler_id);
    }

    componentWillUnmount() {
        this._observers.forEach((handler_id) => {
            this._store.remove_observer(handler_id);
        });
    }
}