import * as React from "react";

export default class Counter extends React.Component {
    state:any;
    props:any;
    constructor(props){
        super(props);
        this.state = {
            num: props.num
        }
    }

    render(){
        return (<div>
            Clicked {this.props.num} times<br />
            <button onClick={this.props.increment}>Go Again</button>
        </div>)
    }
}