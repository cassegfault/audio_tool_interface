import * as React from "react";
import Requests from "requests";
import { error, debug } from "utils/console";
import { audioInterface, AudioTrack } from "lib/AudioInterface";
import { samples_to_timestamp, deepCopy } from "utils/helpers";
import { AudioState } from "app/audio_store";
import StoreComponent from "lib/StoreComponent";

class FileItem extends React.Component<{ file: AudioFile }, { show_settings: boolean, is_renaming: boolean }> {
    constructor(props) {
        super(props);
        this.state = {
            show_settings: false,
            is_renaming: false
        };
    }
    fileDragStart(evt: React.DragEvent, file: AudioFile) {
        evt.dataTransfer.setData("text/plain", file.id);
        evt.dataTransfer.dropEffect = 'copy';
    }
    toggleShowSettings() {
        this.setState({ show_settings: !this.state.show_settings });
    }

    deleteFile() {
        audioInterface.dereferenceFile(this.props.file.id);
    }

    renameFile() {
        if (!this.state.is_renaming) {
            this.setState({
                is_renaming: true,
                show_settings: false
            });
        } else {
            // submit name change
        }
    }

    cancelRename() {
        this.setState({
            is_renaming: false
        });
    }

    render() {
        var file = this.props.file,
            name_part = this.state.is_renaming ?
                (<div>
                    <input value={file.file.name} onBlur={evt => this.renameFile()} />
                    <button onClick={evt => this.renameFile()}>✓</button>
                    <button onClick={evt => this.cancelRename()}>X</button>
                </div>) :
                (<span>{file.file.name}</span>);


        return (<li className="files-list-item"
            draggable
            onDragStart={evt => this.fileDragStart(evt, file)}>
            <div className="files-list-label">
                {name_part}
            </div>
            <div className="files-list-timestamp">{samples_to_timestamp(file.file.length, file.file.sample_rate, false)}</div>
            <div className={this.state.show_settings ? "files-list-actions active" : "files-list-actions"}>
                <button
                    className="icon-button-compact"
                    onClick={evt => this.toggleShowSettings()}>
                    <i className="mdi mdi-dots-horizontal"></i>
                </button>
                <ul className={this.state.show_settings ? "dropdown-list" : "dropdown-list hidden"}>
                    <li className="dropdown-list-item" onClick={evt => this.deleteFile()}>Delete</li>
                    <li className="dropdown-list-item" onClick={evt => this.renameFile()}>Rename</li>
                </ul>
            </div>
        </li>);
    }
}
export default class Files extends StoreComponent<AudioState> {
    state: any;
    upload_input: HTMLElement;
    constructor(props) {
        super(audioInterface.store, props);
        this.state = {
            files: []
        };
        this.add_observer(["files.length", "files.@each.name"], () => { this.forceUpdate(); });
    }

    removeItem(index) {
        audioInterface.dereferenceFile(index);
        this.forceUpdate();
    }

    undo() {
        audioInterface.undo();
        this.forceUpdate();
    }

    redo() {
        audioInterface.redo();
        this.forceUpdate();
    }

    renameFile(id) {
        audioInterface.renameFile(id, "MY NEW NAME");
        this.forceUpdate();
    }

    addTrack() {
        audioInterface.store.dispatch("newTrack", "asdf");
        this.forceUpdate();
    }

    addClip() {
        var file_id = audioInterface.files && audioInterface.files[0].id,
            track_id = audioInterface.tracks && audioInterface.tracks[0].id;
        audioInterface.store.dispatch("addClipToTrack", { track_id, file_id })
        this.forceUpdate();
    }

    play() {
        audioInterface.play();
    }

    stop() {
        audioInterface.stop();
    }

    dragEnter(evt: React.DragEvent) {
        this.setState({ is_dragging: true })
        evt.stopPropagation();
        evt.preventDefault();
    }

    dragLeave(evt: React.DragEvent) {
        this.setState({ is_dragging: false })
        evt.stopPropagation();
        evt.preventDefault();
    }

    dragOver(evt: React.DragEvent) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    fileDrop(evt: React.DragEvent) {
        evt.stopPropagation();
        evt.preventDefault();
        if (evt.dataTransfer.files.length > 0) {
            audioInterface.upload_files(evt.dataTransfer.files);
        }
        this.setState({ is_dragging: false });
    }

    render() {
        const files = audioInterface.files && audioInterface.files.map((file: AudioFile, idx) => {
            return (<FileItem
                key={file.id}
                file={file} />);
        });
        const draggingText = this.state.is_dragging ? (<div className="files-dragging-text">Upload Files</div>) : null;
        return (<div className="files-window"
            onDragEnter={evt => this.dragEnter(evt)}
            onDragLeave={evt => this.dragLeave(evt)}
            onDragOver={evt => this.dragOver(evt)}
            onDrop={evt => this.fileDrop(evt)}>
            <div className="section-header">
                Project Files
                <div className="section-header-actions">
                    <button className="icon-button-compact" onClick={evt => audioInterface.upload_with_dialog()}><i className="mdi mdi-plus"></i></button>
                </div>
            </div>
            <ul className="files-list">
                {files}
            </ul>
            {draggingText}
        </div>)
    }
}