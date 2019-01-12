import * as React from "react";
import Files from "app/components/sections/Files";
import TrackEditor from "app/components/audio/TrackEditor";
import Toolbar from "app/components/sections/Toolbar";
import Menubar, { MenuItem } from "app/components/sections/Menubar";
import { audioInterface } from "lib/AudioInterface";


export default class EditorView extends React.Component {
    state: any;
    menus: Array<MenuItem>;
    constructor(props) {
        super(props);
        this.menus = [{
            label: "File",
            options: [{ 
                    label: "New",
                    action:()=>{}
                },{ 
                    label: "Save",
                    action:()=>{}
                },{ 
                    label: "Import Audio...",
                    action:()=>{ audioInterface.upload_with_dialog(); }
                },{ 
                    label: "Download",
                    action:()=>{}
                }],
        }, {
            label: "Edit",
            options: [{ 
                    label: "Undo",
                    action:()=>{ audioInterface.undo(); }
                },{ 
                    label: "Redo",
                    action:()=>{ audioInterface.redo(); }
                },{ 
                    label: "Cut",
                    action:()=>{}
                },{ 
                    label: "Copy",
                    action:()=>{}
                },{ 
                    label: "Paste",
                    action:()=>{}
                }],
        }, {
            label: "View",
            options: [{ 
                    label: "Zoom",
                    action:()=>{}
                }],
        }, {
            label: "Help",
            options: [
                // Menu Search
                {
                    label: (<span>Search<input type="text" /></span>)
                }
            ]
    }]
    }

    render(): React.ReactNode {

        return (<div className="page editor-page">
                <Menubar menus={this.menus} title="Patrick Carney Interview w/ Audio Podcast" />
                <Toolbar />
                <div className="main-content">
                    <div className="sidebar">
                        <Files />
                    </div>

                    <TrackEditor />
                </div>
            </div>)
    }
    
}