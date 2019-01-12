import * as React from "react";
import Link from "app/components/helpers/Link";
import Login from "app/components/forms/login";

export default class HomeView extends React.Component {
    render() {
        return (<div className="page home-page">
        <h1>Home</h1>
        <div><Login /> </div>
        <Link to="/editor">Go To Editor</Link></div>)
    }
}