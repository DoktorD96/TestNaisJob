const User = require("../models/Users");
module.exports = {
    authCheck: (req) => {
        return new Promise(async function(resolve) {

            if (!(req.isAuthenticated())) {
                resolve(false);
                return;
            }

            if (typeof req.session == null || typeof req.session.passport == null || typeof req.session.passport.user == null) {
                resolve(false);
                return;
            }

            if (req.session.passport.user == null) {
                resolve(false);
                return;
            }

            if (req.session.passport.user.length != 24) {
                resolve(false);
                return;
            }

            try {
                const object = await User.findById(req.session.passport.user);
                if (object != null && object.deleted == false) {
                    resolve(true);
                    return;
                } else {
                    resolve(false);
                    return;
                }
            } catch (e) {
                resolve(false);
                return;
            }
        });
    }
}