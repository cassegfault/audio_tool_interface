import * as React from "react";
import { BaseRoute } from "app/pages/BaseRoute";
import LoginView from "./LoginPage";
import Requests from "requests";

export default class LoginRoute extends BaseRoute {
    view: any = LoginView;
    props: any = {};

    constructor(){
        super();
        // Google requires this font for their signin button
        // we don't need it elsewhere, so only load it here
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css?family=Roboto';
        document.head.appendChild(link);
    }

    async activate({redirect, url, params}){
        if(params.has("error_type")){
            this.props.error_type = params.get("error_type");
            return Promise.resolve();
        } else if (params.has("session_token")){
            this.store.dispatch('set_session_token', decodeURIComponent(params.get("session_token")));
            var { output, status, error_message } = await Requests.get("user");
            if(error_message) {
                redirect(`/login/error/${status}`);
                return Promise.resolve();
            }
            this.store.dispatch('initialize_user', output);
            redirect("/home");
            return Promise.resolve();
        }
    }

    render() {
        return (<LoginView error_type={this.props.error_type}/>)
    }

}