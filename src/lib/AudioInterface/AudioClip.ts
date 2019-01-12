import { audioInterface } from "./index";
import { make_guid } from "utils/helpers";

export default class AudioClip {
    public id: string;
    file_id: string;
    start_position: number;
    track_position: number;
    length: number;
    max_length: number;
    constructor(file_id) {
        this.file_id = file_id;
        this.start_position = 0;
        this.track_position = 0;
        var file = audioInterface.files.find((file) => file.id === file_id);
        this.length = this.max_length = file && (file.file.length / file.file.sample_rate);
        this.id = make_guid();
    }

}