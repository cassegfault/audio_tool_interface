import * as React from "react";
import store from "app/app_store/index";
import Store from "lib/Store";
// Page controllers are singletons
export default class BaseRoute {
    store: Store<any> = store;
    //!- Singleton Logic
    constructor() {
        // To avoid setting the instance on the class directly
        // so that this class may be extended
        var prototype = Object.getPrototypeOf(this);
        // Decide if we're creating an instance or not
        if(prototype._instance) {
            return prototype._instance;
        } 
        prototype._instance = this;
    }
    public static getInstance: any = function() {
        return this._instance;
    }
    //-!
}