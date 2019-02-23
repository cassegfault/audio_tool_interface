import * as React from "react";
import EventManager from "lib/EventManager";
import { debounce } from "utils/helpers";

type InteractiveProps = {
    eventManager: EventManager;
    mouseDownCallback: (Event) => void;
    mouseUpCallback: (Event) => void;
    mouseMoveCallback: (Event) => void;
}

function throttle(delay, fn) {
    let lastCall = 0;
    return function throttled(...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
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
        var debounced_mouse_up = (evt) => this.mouseUp(evt),
            debounced_mouse_down = (evt) => this.mouseDown(evt);
        return (<div className={class_name}
            onMouseDown={debounced_mouse_down}
            onMouseUp={debounced_mouse_up}
            onMouseMove={evt => this.mouseMove(evt)}>
        </div>)
    }
}