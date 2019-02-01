import User from "models/User";

export default {
    user: new User(),

    load(obj) {
        this.user.load(obj);
    }
};