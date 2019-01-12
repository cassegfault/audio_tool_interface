import * as React from "react";
import Requests from "requests";

declare const gapi: any;
export default class Login extends React.Component<{ }> {
    build_request_string() {
        var params = {
            client_id: '49576296038-fvtud273661j4s902uqdt8cunlv14hj8.apps.googleusercontent.com',
            redirect_uri: 'https://audiotool.v3x.pw/api/auth',
            response_type: 'code',
            scope: 'email profile',
            state: ''
        }, param_str = Object.keys(params).map(key => key + '=' + params[key]).join('&');
        return `https://accounts.google.com/o/oauth2/v2/auth?${param_str}`
    }
    init_api () {
        gapi.auth2.init({
            client_id: '49576296038-fvtud273661j4s902uqdt8cunlv14hj8.apps.googleusercontent.com'
        }).then((googleAuth)=>{
            googleAuth.isSignedIn.listen(()=>{
                this.setState({ signed_in: true });
                var user = googleAuth.currentUser.get();
            })
        }, ()=>{
            // error state
        });
    }
    sign_in_google() {
        window.location.href = this.build_request_string();
    }
    sign_in(){
        var email = (this.refs.email as HTMLInputElement).value,
            password = (this.refs.password as HTMLInputElement).value;
        Requests.post("/api/auth", {email, password}).then(()=>{

        });
    }
    render(){
        return (<div>
            <input type="text" ref="email" name="email" />
            <input type="password" ref="password" name="password" />
            <button onClick={evt=>this.sign_in()} >Log In</button>
            <hr />

            <button onClick={evt => this.sign_in_google()}>Sign in with google</button>
        </div>)
    }
};