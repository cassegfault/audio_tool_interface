import * as React from "react";
import Login from "app/components/forms/Login";

interface LoginProps {
    error_type?: string
}

export default class LoginView extends React.Component<LoginProps> {
    state: any;

    constructor(props) {
        super(props);
    }

    render(): React.ReactNode {
        return (<div className="page login-page">
                    <Login />
                </div>)
    }
    
}

export { LoginView, LoginProps }