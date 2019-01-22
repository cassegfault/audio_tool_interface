import * as React from "react";
import Link from "app/components/helpers/Link";
import { app_store } from "app/app_store";

export default class HomeView extends React.Component {
    state: any;
    constructor(props){
        super(props);
        this.state = { email_address: '' };
        app_store.add_observer(['user.email_address'], () => { 
            console.log("fire Update");
            this.forceUpdate();
            //this.setState({ email: app_store.state.user.email_address }); 
        });
    }
    render() {
        console.log("home rendered")
        return (<div className="page home-page">
                    <h1>Welcome { app_store.state.user.email_address }</h1>
                    <Link to="/editor">Go To Editor</Link>
                </div>);
    }
}