import * as React from "react";

export interface MenuItem {
    label: any;
    options: Array<MenuOption>
}
export interface MenuOption {
    label: any;
    action?: Function;
}
export default class Menubar extends React.Component<{ title:string, menus: Array<MenuItem> }> {
    state:any;
    constructor(props: any){
        super(props);
        this.state = {
            show_menus: false,
            last_hovered_menu: null,
        }
    }
    
    toggle_show_menus() {
        this.setState({
            show_menus: !this.state.show_menus
        });
    }
    
    hover_menu(label: string){
        this.setState({
            last_hovered_menu: label
        })
    }

    render() {
        var menus = this.props.menus.map((menu) => {
            var options = menu.options.map((opt) => {
                return (<li className="menubar-menu-option" key={opt.label} onClick={(evt) => opt.action(evt)}>{ opt.label }</li>);
            });
            if (menu.label === this.state.last_hovered_menu && this.state.show_menus) {
                return (<li className="menubar-menu-container hovered" key={menu.label}>
                            <span className="menubar-menu-label" onMouseEnter={evt => this.hover_menu(menu.label)} onClick={evt => this.toggle_show_menus()}>{ menu.label }</span>
                            <ul className="menubar-menu-options">
                                { options }
                            </ul>
                        </li>)
            } else {
                return (<li className="menubar-menu-container" key={menu.label}>
                            <span className="menubar-menu-label" onMouseEnter={evt => this.hover_menu(menu.label)} onClick={evt => this.toggle_show_menus()}>{ menu.label }</span>
                        </li>)
            }
        });
        return (<div className="menubar">
                <ul className="menubar-menus">{menus}</ul>
                <div className="menubar-title">{ this.props.title }</div>
                <div className="menubar-right"></div>
            </div>);
    }
}