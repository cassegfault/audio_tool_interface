import { audioInterface } from "./index";

export default class EditorInfo {
    window_start:any =  0;
    window_end:any =  1;
    is_dragging:any = false;
    selection_start:any =  null;
    selection_end:any =  null;

    set_window(payload) {
        audioInterface.store.dispatch('set_window',payload);
    }
}