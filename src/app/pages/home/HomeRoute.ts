import BaseRoute from "app/pages/PageController";
import { make_singleton } from "utils/helpers";
import HomeView from "./HomePage";

export default class HomeRoute extends BaseRoute {
    view: any = HomeView;

    constructor() {
        super();
    }
}