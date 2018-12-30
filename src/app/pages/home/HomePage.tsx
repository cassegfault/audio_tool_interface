import * as React from "react";
import Link from "app/components/helpers/Link";

export default class HomeView extends React.Component {
    render() {
        return (<div>Home <Link to="/editor">Go To Editor</Link></div>)
    }
}