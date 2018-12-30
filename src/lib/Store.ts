import EventManager from "lib/EventManager";
import { isObj, deepCopy, isArray } from "utils/helpers";
import { warn, error } from "utils/console";
import { STATE_CHANGED } from "utils/symbols";

/** A snapshot of the state for the purposes of reverting or re-committing some action  */
interface MutationHistory {
    type: string | number | symbol,
    stateData: object
}

/** A set of actions to be dispatched by some Store */
export interface ActionsMap {
    [key: string]: (opts: { commit: (key: string, payload: any) => void, payload: any }) => void
}

/** A set of mutations to be committed on some Store */
export interface MutationsMap {
    [key: string]: (opts: { state: any, payload: any, makeProxy: Function }) => void
}

export default class Store<StoreType extends object> {
    actions: Object;
    mutations: Object;
    state: StoreType; // Build an interface for this
    private _state: any;
    is_mutating: boolean = false;
    is_silently_modifying: boolean = false;
    events: EventManager;
    history: Array<MutationHistory> = [];
    future: Array<MutationHistory> = [];
    currentHistoryBatch: Array<MutationHistory> = [];

    constructor(params) {
        this.actions = params.actions || {};
        this.mutations = params.mutations || {};
        this._state = params.state || {};
        this.events = new EventManager();
        this.history.push({
            type: "INIT_STATE",
            stateData: deepCopy(this._state)
        });
        console.group("building state")
        this.state = this.proxy_by_path([]);
        this.update_state();
        console.log("Final State", this.state);
        console.groupEnd();
    }

    /** Creates a proxy for the object held at the path relative to `_state`, provides access to that path through `obj.__store_path__`
     * @param path The property names of each of the ancestors of the property leading back to `_state`
     * @returns A proxy of the child of `_state` described by `path`
     */
    public proxy_by_path(path: string[]) {
        var proxy_set = (state, key, value) => {
            // Only mutate state when permissible, always notify of changes
            if(key === "length"){
                return true;
            }

            if (this.is_mutating) {
                this.currentHistoryBatch.push({
                    stateData: deepCopy(state),
                    type: key
                });

                Reflect.set(state, key, value);
                this.events.fire(STATE_CHANGED, path);
                return true;
            } else  if (this.is_silently_modifying) {
                Reflect.set(state, key, value);
                return true;
            }
            warn("Do not set state objects directly, use an action or mutation");
            return true;
        };
        var proxy_get = (target, property, receiver) => {
            if (property === '__store_path__'){
                return path.join('.');
            }
            return Reflect.get(target, property, receiver);
        };
        return new Proxy(this.get_object_by_path(path), {
            get: proxy_get,
            
            set: proxy_set
        })
    }

    /** Fires `callback` when `path` has been changed
     * @param callback Fires when `path has been changed
     * @param path The path or paths to check. Paths are property names concatenated by '.'
     * @returns String ID of the event handler which can be used to destruct the event handler
     */
    public add_observer(path: string[] | string, callback: (...args) => void) {
        var check_path = path;
        
        if (!isArray(check_path)) {
            check_path = (<string>path).split('.');
        }
        
        var handler_id = this.events.on(STATE_CHANGED, callback, (changed_path: string[]) => {
            var found_diff = changed_path.find((prop, index) => {
                return check_path[index] !== '@each' && check_path[index] !== prop;
            });
            return !!found_diff;
        });

        return handler_id;
    }

    /** Destructs the event handler with id `handler_id`
     * @param handler_id The id of the handler to destruct
     */
    public remove_observer(handler_id: string) {
        this.events.off(STATE_CHANGED, handler_id);
    }

    // Undo / Redo currently is a very heavy implementation currently
    // this needs to be rethought for module support
    /** Reverts the most recent action */
    undo() {
        var lastMutation = this.history.pop(),// This is the mutation that brings us to our current state
            previousMutation = this.history.length > 0 ? this.history[this.history.length - 1] : null; 
        if (!previousMutation) {
            throw "Calling undo with no history";
        }
        this.future.unshift(lastMutation); // Push our current state into the future
        console.log('previousMutation',previousMutation);
        this.is_silently_modifying = true;
        this.state = Object.assign(this.state, deepCopy(previousMutation.stateData));
        console.group('UNDO')
            console.log('assigned state', JSON.stringify(this.state));
            console.log('last stateData', previousMutation.stateData);
        console.groupEnd();
        this.is_silently_modifying = false;
    }

    /** Commits the last reverted action */
    redo() {
        var nextMutation = this.future.shift();
        if (!nextMutation) {
            throw "Calling redo with no future";
        }
        this.is_silently_modifying = true;
        this.history.push(nextMutation);
        this.state = Object.assign(this.state, deepCopy(nextMutation.stateData));
        this.is_silently_modifying = false;
    }

    /** Calls an action `key` with paramater `payload` */
    dispatch(key: string, payload: any) {
        if(!this.actions[key]) {
            error(`Action dispatched that does not exist: ${key}`);
            return;
        }
        this.actions[key]({commit: this.commit.bind(this), payload });
    }

    /** Calls an mutation `key` with paramater `payload`, should only be called from actions */
    commit(key: string, payload: any) {
        if(typeof this.mutations[key] !== 'function') {
            error(`Mutation committed that does not exist: ${key}`);
            return false;
        }

        this.is_mutating = true;

        var params = {
            state: this.state,
            payload
        };
        this.mutations[key](params);
        this.update_state();
        
        // Combine current mutation set
        // It's possible this is better placed at the action level
        var mutation = deepCopy(this.state);
        this.currentHistoryBatch.forEach((mutationPiece)=>{
            mutation = Object.assign(mutation, mutationPiece.stateData);
        });
        this.history.push({
            type: "Mutation",
            stateData: mutation
        });
        this.currentHistoryBatch = [];


        this.is_mutating = false;
        return true;
    }

    /** Returns an object in the state located at the path array
     * @param path Array of strings representing a succession of children of `_state`
     */
    get_object_by_path(path: string[]){
        var current = this._state;
        path.forEach((part) => {
            current = current[part];
        });
        return current;
    }

    /** Updates all objects in the state to be proxies and be accessible by path */
    update_state() {
        var currentPath = [],
            walk_state = (obj) => {
                Object.keys(obj).forEach((key) => {
                    if (isObj(obj[key]) || isArray(obj[key])) {
                        currentPath.push(key);
                        walk_state(obj[key]);
                        currentPath.pop();
                        if (!obj[key].__store_path__) {
                            // not a proxy
                            this.is_silently_modifying = true;
                            obj[key] = this.proxy_by_path([].concat(currentPath,[key]));
                            this.is_silently_modifying = false;
                        }
                    }
                });
            }
        walk_state(this.state);
    }
}