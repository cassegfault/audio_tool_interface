import * as React from "react";
import { BaseAuthenticatedRoute } from "app/pages/BaseRoute";
import EditorView from "./EditorPage";
import { warn } from "utils/console";

export default class EditorRoute extends BaseAuthenticatedRoute {
    view: any = EditorView;
    project_id: string;
    activate({ params, redirect }) {
        if (!params.has("project_id")) {
            warn("Did not receive project_id", params);
            return redirect('/');
        }
        this.project_id = params.get("project_id");
    }

    render(): React.ReactNode {
        return (<EditorView project_id={this.project_id} />)
    }

}