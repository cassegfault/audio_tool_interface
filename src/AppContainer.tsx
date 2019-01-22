import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Sentry from '@sentry/browser';
import router from "./routes";

export default class AppContainer extends React.Component {
    state: any = {
        active_page: null
    }
    constructor(props) {
        super(props);
        router.route_change_callback = () => { this.forceUpdate(); };
    }
    
    componentDidCatch(error, errorInfo) {
        Sentry.withScope(scope => {
            Object.keys(errorInfo).forEach(key => {
              scope.setExtra(key, errorInfo[key]);
            });
            Sentry.captureException(error);
          });
    }
    
    render() {
        const TagName = router.active_route && router.active_route.view;
        //return TagName ? React.createElement(TagName,null): (<span></span>);
        return router.active_route ? router.active_route.render() : (<span></span>);
    }
}