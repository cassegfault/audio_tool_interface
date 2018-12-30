import { AudioInterface } from "./index";
import { make_guid } from "utils/helpers";

export default class AudioClip {
    public id: string;
    file_id: string;
    start_position: number;
    length: number;
    constructor(file_id) {
        var audioInterface = AudioInterface.getInstance();
        this.file_id = file_id;
        this.start_position = 0;
        var file = audioInterface.files.find((file) => file.id === file_id);
        this.length = file && file.file.length;
        this.id = make_guid();
    }
}