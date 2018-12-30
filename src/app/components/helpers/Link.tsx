import * as React from "react";
import router from "routes";

interface LinkProps {
    to: string;
    children: any;
}

export default class Link extends React.Component<{}, LinkProps> {
    props: LinkProps;
    
    navigate() {
        router.navigate(this.props.to)
    }

    render(){
        return (<a onClick={evt => this.navigate()}>
                    {this.props.children}
                </a>)
    }
}