import { audioInterface } from "./index";
import { make_guid } from "utils/helpers";
interface AudioClipConstructionParameters {
    id?: string,
    file_id: string,
    start_position?: number,
    track_position?: number,
    length?: number,
    max_length?: number
}
export default class AudioClip {
    public id: string;
    file_id: string;
    start_position: number;
    track_position: number;
    length: number;
    max_length: number;
    constructor({ id, file_id, start_position, track_position, length, max_length }: AudioClipConstructionParameters) {
        this.id = id || this.id || make_guid();
        this.file_id = file_id;
        this.start_position = start_position || 0;
        this.track_position = track_position || 0;

        if (!length || !max_length) {
            var file = audioInterface.files.find((file) => file.id === file_id);
            this.length = this.max_length = file && (file.file.length / file.file.sample_rate);
        } else {
            this.length = length;
            this.max_length = max_length;
        }
    }

}