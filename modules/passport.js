const User = require("../models/Users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email', //can be 'email' or 'whateveryouwant'
        passwordField: 'pass' //same thing here
    },
    function(username, password, cb) {
        console.log("test");
        User.findOne({ email: username, pass: password })
            .then((user) => {
                if (!user) { return cb(null, false) }
                return cb(null, user);
            })
            .catch((err) => {
                cb(err);
            });
    }));
// function(email, pass, cb) {

// }));

passport.serializeUser(function(user, cb) {
    console.log("test 1");
    cb(null, user.id);
});
passport.deserializeUser(function(id, cb) {
    console.log("test 2");
    User.findById(id, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

module.exports = passport;