import Project from "./Project";

export default class User {
    session_token: string;
    id: number;
    email_address: string;

    projects: Array<Project> = [];

    load(obj) {
        this.id = obj.id || this.id;
        this.email_address = obj.email_address || this.email_address;
    }
}