import * as React from "react";
import Files from "app/components/sections/Files";
import TrackEditor from "app/components/audio/TrackEditor";
import Toolbar from "app/components/sections/Toolbar";


export default class EditorView extends React.Component {
    state: any 
    constructor(props) {
        super(props);
        
    }

    render(): React.ReactNode {

        return (<div>
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