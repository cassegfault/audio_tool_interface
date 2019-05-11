import * as React from "react";
import Link from "app/components/helpers/Link";
import { Session } from "lib/Session";
import router from "routes";

export default class HomeView extends React.Component {
    state: any;
    constructor(props) {
        super(props);
        this.state = { email_address: '' };
        Session.store.add_observer(['user.email_address', 'user.projects', 'user.projects.length'], () => {
            this.forceUpdate();
        });
        Session.get_projects();
    }

    newProject() {

    }
    loadProject(guid: string) {
        router.navigate(`/projects/${guid}`);
    }

    render() {
        var items = Session.user.projects.map(project => {
            return (<div key={project.guid} className="project-item" onClick={evt => this.loadProject(project.guid)}>
                <div className="project-item-icon"></div>
                <div className="project-item-details">
                    <div className="project-item-name">{project.name}</div>
                    <div className="project-item-meta">{project.guid}</div>
                </div>
            </div>);
        });
        items.unshift((<div key="new" className="project-item" onClick={evt => this.newProject()}>
            <div className="project-item-icon">+</div>
            <div className="project-item-details">
                <div className="project-name">Create a New Project</div>
            </div>
        </div>));
        var gridClass = `home-navigation-grid ${items.length % 2 == 0 ? 'count-even' : 'count-odd'}`

        return (<div className="page home-page">
            <div className="logo-bar">
                <h1 className="logo-container">
                    <img src="/img/logo.svg" alt="helloAudio Logo" className="logo-image" />
                    <span className="logo-text">helloAudio</span>
                </h1>
                <div className="account-nav-container">
                    <div className="account-nav-icon">{Session.user.email_address.slice(0, 1).toUpperCase()}</div>
                    <div className="account-nav-label">
                        <div>Signed in as</div>
                        <div className="account-nav-email">{Session.user.email_address}</div>
                    </div>
                </div>
            </div>

            <div className="list-selector">
                <div className="list-selector-option">Projects</div>
                <div className="list-selector-option">Files</div>
            </div>
            <div className={gridClass}>
                {items}
            </div>
        </div>);
    }
}