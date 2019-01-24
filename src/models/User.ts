import Project from "./Project";

export default class User {
    session_token: string;
    id: number;
    email_address: string;

    projects: Array<Project> = [];
}