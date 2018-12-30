import * as React from "react";
import * as ReactDOM from "react-dom";
declare global {
    interface Window { _router: any; }
}

import store from "lib/store";
import router from "./routes";

class PageRenderer extends React.Component {
    state: any = {
        active_page: null,
        route_params: null
    }
    constructor(params) {
        super(params);
        router.route_change_callback = (params)=>{this.change_route(params)};
    }
    change_route(params) {
        this.setState({
            route_params: params
        });
    }
    render() {
        console.log("page render", router.active_route);
        const TagName =  router.active_route && router.active_route.view;
        console.log("tagname", TagName, router.active_route);
        return TagName ?  React.createElement(TagName,null): (<span><h1>Router not started</h1></span>);
    }
}
window._router = router;
ReactDOM.render(
    <PageRenderer />,
    document.getElementById("app")
);
router.resolve();