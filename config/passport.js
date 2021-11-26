const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("../models/Users.js");

// # PASSPORT LOCAL STRATEGY
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
    function(username, password, cb) {
        User.findOne({ email: username, pass: password })
            .then((user) => {
                if (!user) { return cb(null, false) }
                return cb(null, user);
            })
            .catch((err) => {
                cb(err);
            });
    }
));

// # PASSPORT SERIALIZE
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});


// # PASSPORT DESERIALIZE
passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});