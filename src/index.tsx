import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Sentry from '@sentry/browser';
import router from "./routes";
import AppContainer from "./AppContainer";
import Requests from "requests";
import { audioInterface } from "lib/AudioInterface";
require('styles/index.less');
declare global {
    interface Window {
        _router: any;
        _requests: any;
        _audio_interface: any;
    }
}

function build_app() {
    //Sentry.init({dsn:'https://3899c6bb0f8647abaaaa8a4dd01921c9@sentry.v3x.pw/2'});
    ReactDOM.render(
        <AppContainer />,
        document.getElementById("app")
    );
    router.resolve();
}

window._requests = Requests;
window._router = router;
window._audio_interface = audioInterface;
window.addEventListener('load', build_app);