import * as React from "react";
import EventManager from "lib/EventManager";

type InteractiveProps = {
    eventManager: EventManager;
    mouseDownCallback: (Event) => void;
    mouseUpCallback: (Event) => void;
    mouseMoveCallback: (Event) => void;
}

export default class Interactable extends React.Component<InteractiveProps> {
    state: any;
    constructor(props) {
        super(props);
        this.state = {
            is_interacting: false
        }
    }

    mouseDown(evt: any) {
        this.setState({ is_interacting: true });
        this.props.mouseDownCallback(evt);
    }

    mouseUp(evt: any) {
        this.setState({ is_interacting: false });
        this.props.mouseUpCallback(evt);
    }

    mouseMove(evt: any) {
        this.props.mouseMoveCallback(evt);
    }

    render() {
        const class_name = "interactable active";
        return (<div className={class_name}
            onMouseDown={evt => this.mouseDown(evt)}
            onMouseUp={evt => this.mouseUp(evt)}
            onMouseMove={evt => this.mouseMove(evt)}>
        </div>)
    }
}