import { audioInterface, AudioClip } from "./index";
import { nonenumerable } from "utils/helpers";
export default class EditorInfo {
    window_scale: number = 10;
    is_dragging: any = false;
    current_position: number = 0;
    project_length: number = 0;

    selection: EditorSelection = {
        time_start: null,
        time_end: null,
        track_selections: []
    };

    constructor() {
        nonenumerable(this, "selection");
    }

    set_window(payload) {
        audioInterface.store.dispatch('set_window', payload);
    }

    load(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = obj[key];
            }
        }
    }
}