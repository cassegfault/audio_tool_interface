import { make_guid, extend } from "utils/helpers";
import { error, log, debug, warn } from "utils/console";
import Store from "../Store";
import audio_store, { AudioState } from "app/audio_store";
import AudioTrack from "./AudioTrack";
import EditorInfo from "./EditorInfo";
import Requests from "requests";
import AudioClip from "./AudioClip";
declare global {
    interface Window { audioInterface: any; }
}

//https://lukasbehal.com/2017-05-22-enums-in-declaration-files/
// ^ agreed, not sure what to do about it
enum AudioFileStatus {
    error = 'error',
    uploading = 'uploading',
    processing = 'processing',
    downloading = 'downloading'
}
interface UploadingAudioFile extends AudioFile {
    request: Promise<any>;
    status: AudioFileStatus;
    error_message?: string;
}
class AudioInterface {
    //!- singleton logic
    private static _instance: AudioInterface = new AudioInterface();
    private _audio_nodes: AudioBufferSourceNode[] = [];
    private constructor() {
        // Decide if we're creating an instance or not
        if (AudioInterface._instance) {
            return AudioInterface._instance;
        }
        AudioInterface._instance = this;
    }
    public static getInstance() {
        return AudioInterface._instance;
    }
    //-!

    store: Store<AudioState> = audio_store;
    current_project_id: string;
    current_project_name: string;

    private ctx = new AudioContext();
    private audioMap: Map<string, AudioBuffer> = new Map();

    processing_files: AudioFile[] = [];

    public get files(): AudioFile[] {
        return this.store.state.files;
    }

    get_file_data(file_id: string) {
        return this.audioMap.get(file_id);
    }

    public get tracks(): AudioTrack[] {
        return this.store.state.tracks;
    }

    public get editorInfo(): EditorInfo {
        return this.store.state.editorInfo;
    }

    public load(data: AudioState, project_id: string, name: string): void {
        this.current_project_id = project_id;
        this.current_project_name = name;
        data.editorInfo = new EditorInfo();
        this.store.setup_state(data);
        this.store.state.files.forEach((file) => {
            this.loadAudioForFile(file.id);
        });
    }
    public save(data: AudioState): void {
        var project_data = {
            id: this.current_project_id,
            name: this.current_project_name
        }
        Requests.post("project", project_data).then(() => {
            debug("Saved")
        }).catch(() => {
            warn("Failed to save")
        });
    }

    undo() {
        this.store.undo();
    }

    redo() {
        this.store.redo();
    }

    upload_with_dialog(allow_multiple: boolean = false) {
        return new Promise((resolve, reject) => {
            var el = document.createElement("input");
            el.type = "file";

            if (allow_multiple)
                el.multiple = true;

            el.onchange = () => {
                this.upload_files(el.files);
            }
            el.click();
        });
    }

    upload_files(files: FileList) {
        debug("uploading files")
        // Each file gets uploaded separately to reduce processing time
        for (var idx = 0; idx < files.length; idx++) {
            // This is asynchronous, so all requests will go out at once
            this.upload_file(files[idx]);
        }
    }

    async upload_file(file: File) {
        var d = new FormData(),
            tempFile: UploadingAudioFile;
        debug("uploading file")
        d.append(`file`, file);

        var tempFile: UploadingAudioFile = {
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                sample_rate: undefined,
                length: undefined
            },
            request: undefined,
            status: undefined,
            id: undefined,
            data: undefined
        };

        var tempFileIdx = this.processing_files.push(tempFile);
        tempFile.status = AudioFileStatus.uploading;

        // First we need to create the file
        var { output, error_message } = await Requests.post(`file?name=${tempFile.file.name}`, d);

        if (error_message) {
            tempFile.status = AudioFileStatus.error;
            tempFile.error_message = "Error Uploading File";
            return Promise.reject(`There was an error uploading the file: ${error_message}`);
        }

        tempFile.status = AudioFileStatus.downloading;

        // Fill the file with info from the server
        tempFile.id = output.guid;
        tempFile.file.sample_rate = output.sample_rate;
        //tempFile.file.length = output.length;

        // Then we retrieve the processed audio data
        try {
            var { raw_response: arrayBuffer } = await Requests.get("file_data", null, { responseType: "arraybuffer", url_parameters: { guid: tempFile.id } });
        } catch (e) {
            warn("Problem with requesting file data", e);
        }

        tempFile.status = AudioFileStatus.processing;
        try {
            await audioInterface.loadFile(arrayBuffer, tempFile.id, tempFile);
        } catch (e) {
            warn("Could not load file", e);
        }

        // Swap the file from temporary to permanent
        this.store.dispatch('addFile', tempFile);
        this.processing_files.splice(tempFileIdx, 1);
        debug("Finished adding file");
    }

    loadFile(buf: ArrayBuffer, guid: string, file?: AudioFile) {
        return new Promise((resolve, reject) => {
            try {
                debug("decoding audio data", buf);
                this.ctx.decodeAudioData(buf, (audioBuffer: AudioBuffer) => {
                    debug("sucessfully decoded", audioBuffer);
                    this.audioMap.set(guid, audioBuffer);
                    if (file) {
                        file.file.length = audioBuffer.length;
                    }
                    var idx = this.files.findIndex(existing_file => existing_file.id === guid);
                    this.store.did_update(`files.${idx}`);
                    resolve(this.store.state.files)
                }, (e) => {
                    warn(`Error decoding audio data: ${e}`);
                });
            } catch (e) {
                warn("Could not decode audio data from API");
                reject(e);
            }
        });
    }

    async loadAudioForFile(guid: string) {
        var { raw_response: output, error_message } = await Requests.get("file_data", { guid }, { responseType: 'arraybuffer' });
        if (error_message)
            throw new Error(`Error loading file data: ${error_message}`);
        try {
            await this.loadFile(output, guid);
        } catch (e) {
            warn(`Error loading file: ${e}`);
        }
    }

    dereferenceFile(id: string) {
        this.store.dispatch('removeFile', id);
    }

    renameFile(id: string, name: string) {
        this.store.dispatch('renameFile', { id, name });
    }

    addTrack() {
        this.store.dispatch('newTrack', {});
    }

    play() {
        this.tracks.forEach((track) => {
            var track_gain = new GainNode(this.ctx);
            track.clips.forEach((clip) => {
                var newNode = new AudioBufferSourceNode(this.ctx, { buffer: this.audioMap.get(clip.file_id) })
                this._audio_nodes.push(newNode);
                newNode.connect(track_gain);
                newNode.start(this.ctx.currentTime + clip.start_position, 0, clip.length);
            });
            track_gain.connect(this.ctx.destination);
        });
    }

    saveMedia() {
        var pcm_length = Math.floor(this.store.state.editorInfo.project_length * 48000),
            outputData = new Float32Array(pcm_length),
            marker_data = { 0: [] },
            markers = [0];

        this.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
                var start_pcm = Math.floor(clip.track_position * 48000),
                    end_pcm = Math.floor(start_pcm + (clip.length * 48000));
                if (!markers.hasOwnProperty(start_pcm)) {
                    marker_data[start_pcm] = [];
                    markers.push(start_pcm);
                }
                if (!markers.hasOwnProperty(end_pcm)) {
                    marker_data[end_pcm] = [];
                    markers.push(end_pcm);
                }
            });
        });

        markers.forEach((start_idx, marker_idx) => {
            this.tracks.forEach((track) => {
                track.clips.forEach((clip) => {
                    var clip_start_idx = Math.floor(clip.track_position * 48000),
                        clip_end_idx = Math.floor(clip_start_idx + Math.floor(clip.length * 48000));
                    if (clip_start_idx <= start_idx && clip_end_idx > start_idx) {
                        marker_data[start_idx].push(clip);
                    }
                });
            });
        });
        markers.sort((a, b) => a - b);

        var current_marker_index = 0;
        for (var idx = 0; idx < pcm_length; idx++) {
            var all_clips = [];
            var last_marker = 0;
            for (var midx = current_marker_index; midx < markers.length; midx++) {
                if (markers[midx] <= idx && markers[midx + 1] > idx) {
                    current_marker_index = midx;
                    last_marker = markers[midx];
                    break;
                }
            }
            if (last_marker > 0)
                debugger;
            var sum = 0,
                did_error = false;
            marker_data[last_marker].forEach((clip: AudioClip) => {
                var file_data = this.audioMap.get(clip.file_id),
                    file_idx = Math.floor(clip.start_position * 48000) + (idx - Math.floor(clip.track_position * 48000));

                var csum = 0;
                for (var cidx = 0; cidx < file_data.numberOfChannels; cidx++) {
                    var tmp = file_data.getChannelData(cidx);
                    csum += tmp[file_idx];
                    if (tmp.length < file_idx) {
                        did_error = true;
                    }
                }
                if (did_error) {
                    debugger;
                    console.error("Accessed invalid index");
                }
                sum += csum / file_data.numberOfChannels;
            });

            outputData[idx] = sum / marker_data[last_marker].length || 0;
        }

        function floatTo16BitPCM(output, offset, input) {
            for (let i = 0; i < input.length; i++ , offset += 2) {
                let s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        console.log(outputData);
        let buffer = new ArrayBuffer(44 + outputData.length * 2);
        let view = new DataView(buffer),
            sample_rate = 48000;
        writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + outputData.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sample_rate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sample_rate * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 1 * 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, outputData.length * 2, true);

        floatTo16BitPCM(view, 44, outputData);

        var blob = new Blob([view], { type: 'audio/wav' });

        var url = window.URL.createObjectURL(blob),
            link = document.createElement("a");
        link.classList.add("hidden");
        link.href = url;
        link.download = 'output.wav';
        document.body.appendChild(link);
        /*let click = document.createEvent("Event");
        click.initEvent("click", true, true);
        link.dispatchEvent(click);*/
        link.click();
        window.URL.revokeObjectURL(url);
    }

    stop() {
        this._audio_nodes.forEach((node) => node.stop());
    }
}

/** AudioInterface instance for cleaner imports */
const audioInterface = AudioInterface.getInstance();

export { AudioInterface, audioInterface, AudioFileStatus };