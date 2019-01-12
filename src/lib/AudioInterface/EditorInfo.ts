import { audioInterface } from "./index";

export default class EditorInfo {
    window_start:number =  0;
    window_end:number =  1;
    window_scale: number = 10;
    is_dragging:any = false;
    selection_start:any =  null;
    selection_end:any =  null;
    current_position: number = 0;
    project_length: number = 0;
    
    set_window(payload) {
        audioInterface.store.dispatch('set_window',payload);
    }
}