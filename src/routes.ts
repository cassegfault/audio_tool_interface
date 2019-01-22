import Router from "lib/Router";

// Page Routes
import EditorRoute from "app/pages/editor/EditorRoute";
import HomeRoute from "app/pages/home/HomeRoute";
import LoginRoute from "app/pages/login/LoginRoute";

var router = new Router({
    '/': new HomeRoute(),
    '/login': new LoginRoute(),
    '/login/error/:error_type': new LoginRoute(),
    '/login/success/:session_token': new LoginRoute(),
    '/projects/:project_id': new EditorRoute(),
});
router.setDefaultRoute("/");

export default router;