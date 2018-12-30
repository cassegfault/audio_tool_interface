import Router from "lib/Router";

// Page Routes
import EditorRoute from "app/pages/editor/EditorRoute";
import HomeRoute from "app/pages/home/HomeRoute";

var router = new Router({
    '/editor': new EditorRoute(),
    '/': new HomeRoute()
});
router.setDefaultRoute("/");

export default router;