// A very small router loosely based on Navigo
export default class Router {
    _routes: Map<string, any> = new Map();
    active_route: any;
    route_change_callback: Function = null;
    default_route: string = "/";

    constructor(routes:object = {}) {
        window.addEventListener('popstate', this.resolve.bind(this));
        Object.keys(routes).forEach((route) => {
            this._routes.set(route, routes[route]);
        });
    }

    replace_dynamic_parts(route) {
        var param_names: object = {},
            path_parts: string[] = route.split('/');
        path_parts.forEach((item, index) => {
            if (item[0] === ':') {
                param_names[index.toString()] = item.substr(1);
            }
        });
        return { path_parts, param_names };
    }

    find_route(path) {
        var path_parts = path.split('/');
        var params, route_instance, route_name;
        for(let [route, instance] of this._routes) {
            params = {};
            var { path_parts: route_path_parts, param_names } = this.replace_dynamic_parts(route);
            var bad_match = route_path_parts.find((route_part, index) => {
                if(Object.keys(param_names).indexOf(index.toString()) > -1) {
                    params[param_names[index.toString()]] = route_part;
                    return false;
                }
                return route_part !== path_parts[index];
            });
            if (!bad_match) {
                route_instance = instance;
                route_name = route
                break;
            }
        }
        if (route_instance) {
            return { params, route_instance, route_name }
        } else {
            console.log("Default route", this.default_route, this._routes[this.default_route]);
            return { 
                route_instance: this._routes[this.default_route], 
                route_name, 
                params: {} 
            };
        }
    }

    navigate(path) {
        window.history.pushState({},'',path);
        this.resolve();
    }

    setDefaultRoute(route: string){
        this.default_route = route;
    }

    resolve(url?: string) {
        if(typeof url !== "string"){
            url = window.location.pathname;
        }
        console.log(`resolving ${url}`);
        var { route_instance, params } = this.find_route(url);
        this.active_route = route_instance;
        this.route_change_callback(params);
    }
}