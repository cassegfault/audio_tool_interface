import * as React from "react";
import BaseRoute from "app/pages/PageController";
import EditorView from "./EditorPage";

export default class EditorRoute extends BaseRoute {
    num: number;
    view: any = EditorView;
    
    constructor() {
        super();
        this.num = 0;
    }

    increment() {
        this.num++;
    }
    render(): React.ReactNode {
        return (<EditorView />)
    }

}