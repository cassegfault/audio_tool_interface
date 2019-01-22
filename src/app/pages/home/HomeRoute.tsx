import * as React from "react";
import { BaseAuthenticatedRoute } from "app/pages/BaseRoute";
import HomeView from "./HomePage";

export default class HomeRoute extends BaseAuthenticatedRoute {
    view: any = HomeView;

    constructor() {
        super();
    }
    render(): React.ReactNode {
        return (<HomeView />)
    }
}