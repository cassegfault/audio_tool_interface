import { string, instanceOf } from "prop-types";
import { BaseRoute } from "app/pages/BaseRoute";
import { debug } from "utils/console";

// A very small router loosely based on Navigo
export default class Router {
    _routes: Map<string, BaseRoute> = new Map();
    active_route: any;
    route_change_callback: Function = null;
    default_route: string = "/";
    will_redirect: boolean = false;
    will_redirect_to: string = null;

    constructor(routes: object = {}) {
        window.addEventListener('popstate', this.resolve.bind(this));
        Object.keys(routes).forEach((route) => {
            this._routes.set(route, routes[route]);
        });
    }

    replace_dynamic_parts(route): { path_parts: string[], param_names: object } {
        var param_names: object = {},
            path_parts: string[] = route.split('/');
        path_parts.forEach((item, index) => {
            if (item[0] === ':') {
                param_names[index.toString()] = item.substr(1);
            }
        });
        return { path_parts, param_names };
    }

    find_route(path): { route_instance: BaseRoute, params: Map<string, string>, route_name: string } {
        var path_parts = path.split('/');
        debug(path_parts)
        var params: Map<string, string>,
            route_instance: BaseRoute,
            route_name: string;

        for (let [route, instance] of this._routes) {
            params = new Map<string, string>();
            var { path_parts: route_path_parts, param_names } = this.replace_dynamic_parts(route);

            if (path_parts.length !== route_path_parts.length) {
                continue;
            }

            var bad_match = route_path_parts.find((route_part, index) => {
                if (Object.keys(param_names).indexOf(index.toString()) > -1) {
                    params.set(param_names[index.toString()], path_parts[index]);
                    return false;
                }
                return route_part !== path_parts[index];
            });

            if (bad_match === undefined) {
                route_instance = instance;
                route_name = route
                break;
            }
        }
        if (route_instance) {
            return { params, route_instance, route_name }
        } else {
            return {
                route_instance: this._routes.get(this.default_route),
                route_name: this.default_route,
                params: new Map<string, string>()
            };
        }
    }

    navigate(path: string): void {
        window.history.pushState({}, '', path);
        this.resolve();
    }

    setDefaultRoute(route: string): void {
        this.default_route = route;
    }

    redirect(path: string): void {
        this.will_redirect = true;
        this.will_redirect_to = path;
    }

    async resolve(url?: string) {
        if (typeof url !== "string") {
            url = window.location.pathname;
        }
        var { route_instance, route_name, params } = this.find_route(url);
        if (this.active_route && this.active_route.deactivate) {
            await this.active_route.deactivate();
        }
        if (route_instance.authenticate) {
            await route_instance.authenticate({ redirect: this.redirect.bind(this) });
        }
        if (!this.will_redirect && route_instance.activate) {
            await route_instance.activate({ redirect: this.redirect.bind(this), params, url });
        }

        /* 
            The activate hook has the opportunity to redirect,
            if it did, we need to stop resolving this route and
            resolve the redirect
        */
        if (!this.will_redirect) {
            debug(`Navigated to ${route_name}`)
            this.active_route = route_instance;
            this.route_change_callback(params);
        } else {
            var redirect_to = this.will_redirect_to;
            this.will_redirect = false;
            this.will_redirect_to = "";
            this.navigate(redirect_to);
        }
    }
}