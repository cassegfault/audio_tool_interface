import * as React from "react";
import Files from "app/components/sections/Files";
import TrackEditor from "app/components/audio/TrackEditor";
import Toolbar from "app/components/sections/Toolbar";
import Menubar, { MenuItem } from "app/components/sections/Menubar";
import { audioInterface } from "lib/AudioInterface";
import Requests from "requests";
import audio_store from "app/audio_store";
import { debounce } from "utils/helpers";
import { hotkeys } from "lib/HotkeyManager";
import { debug } from "utils/console";


export default class EditorView extends React.Component<{ project_id: string }> {
    state: any;
    project_id: any;
    project_name: any;
    menus: Array<MenuItem>;

    constructor(props) {
        super(props);
        this.state = {
            is_loading: true
        };
        this.load_project(props.project_id).then(() => { this.setState({ is_loading: false }); });
        this.menus = [{
            label: "File",
            options: [{
                label: "New",
                action: () => { }
            }, {
                label: "Save",
                action: () => { }
            }, {
                label: "Import Audio...",
                action: () => { audioInterface.upload_with_dialog(); }
            }, {
                label: "Download",
                action: () => { }
            }],
        }, {
            label: "Edit",
            options: [{
                label: "Undo",
                action: () => { audioInterface.undo(); }
            }, {
                label: "Redo",
                action: () => { audioInterface.redo(); }
            }, {
                label: "Cut",
                action: () => { }
            }, {
                label: "Copy",
                action: () => { }
            }, {
                label: "Paste",
                action: () => { }
            }],
        }, {
            label: "View",
            options: [{
                label: "Zoom",
                action: () => { }
            }],
        }, {
            label: "Help",
            options: [
                // Menu Search
                {
                    label: (<span>Search<input type="text" /></span>)
                }
            ]
        }];
        var editorInfo = audioInterface.editorInfo;
        // This could be configurable and saved to the users account
        hotkeys.initialize({
            'alt+tab': (e) => { e.preventDefault(); console.warn('pressed alt+tab') },
            'delete': (e) => {
                editorInfo.selection.track_selections.forEach((clips, track_idx) => {
                    if (!clips)
                        return;
                    audioInterface.tracks[track_idx].removeClips(clips);
                });

            }
        })
    }

    async load_project(project_id: string) {
        var { output, error_message } = await Requests.get("project", { guid: project_id });
        if (error_message) {
            return Promise.reject();
        }
        this.project_id = project_id;
        this.project_name = output.name;
        audioInterface.load(JSON.parse(output.project_data), project_id, output.name);
        audioInterface.store.add_observer(["files.@each", "tracks.@each", ""], debounce(50, () => {
            debug("Saving Project");
            this.save_project();
        }));
    }

    async save_project() {
        await Requests.post("project", { guid: this.project_id, name: this.project_name, project_data: JSON.stringify(audioInterface.store.state) });
    }

    render(): React.ReactNode {
        if (this.state.is_loading) {
            return (<div className="page editor-page">Loading...</div>)
        }
        return (<div className="page editor-page">
            <Menubar menus={this.menus} title={this.project_name} />
            <Toolbar />
            <div className="sidebar">
                <Files />
            </div>
            <TrackEditor />
        </div>)
    }

}