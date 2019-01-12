import { make_guid } from "utils/helpers";
import { debug } from "utils/console";

type EventHandle = {
    check_func: (...args) => boolean,
    callback: (...args) => void
}

export default class EventManager {
    // Maps cannot be used properly with bracket syntax, be careful!
    queue: Map<string, Map<string, EventHandle> > = new Map();

    /** Calls _callback_ when event _e_ is fired and check_func returns true 
     * @param e The event identifier on which to callback
     * @param callback The function to be fired when the event is called
     * @param check_func To check the contents of the payload and decide whether to call the callback
    */
    on(e: string, callback: (...args) => void, check_func?: (...args) => boolean) {
        var guid = make_guid();

        if (typeof this.queue.get(e) === "undefined")
            this.queue.set(e, new Map());

        this.queue.get(e).set(guid, { callback, check_func });        
        return guid;
    }

    off(e: string, guid: string) {
        if (!this.queue.has(e) || this.queue.get(e).has(guid))
            return
        
        this.queue.get(e).delete(guid);
    }
    
    fire(e: string, ...args: any[]) {
        if (!this.queue.has(e)) {
            console.warn(`Could not find event ${e}`)
            return;
        }
        
        debug(`Firing ${e} with ${this.queue.get(e).size}`, this.queue.get(e), ...args);

        this.queue.get(e).forEach((handle: EventHandle) => {
            if (!handle.check_func || handle.check_func(...args)) {
                handle.callback(...args);
            }
        });
    }
}