const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("../models/Users.js");

passport.use(new LocalStrategy(
    function(username, password, cb) {
        User.findOne({ username: username, password: password })
            .then((user) => {
                if (!user) { return cb(null, false) }
                return cb(null, user);
            })
            .catch((err) => {
                cb(err);
            });
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});




// app.get('/', (req, res, next) => {
//     res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
// });
// app.get('/login', (req, res, next) => {

//     const form = '<h1>Login Page</h1><form method="POST" action="/login">\
//     Enter Username:<br><input type="text" name="username">\
//     <br>Enter Password:<br><input type="password" name="password">\
//     <br><br><input type="submit" value="Submit"></form>';

//     res.send(form);

// });
// app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }), (err, req, res, next) => {
//     if (err) next(err);
// });
// app.get('/register', (req, res, next) => {

//     const form = '<h1>Register Page</h1><form method="post" action="register">\
//                     Enter Username:<br><input type="text" name="username">\
//                     <br>Enter Password:<br><input type="password" name="password">\
//                     <br><br><input type="submit" value="Submit"></form>';

//     res.send(form);

// });
// app.post('/register', (req, res, next) => {
//     const newUser = new User({
//         username: req.body.username,
//         password: req.body.password,
//     });
//     newUser.save()
//         .then((user) => {
//             console.log(user);
//         });
//     res.redirect('/login');
// });
// app.get('/protected-route', (req, res, next) => {
//     console.log(req.session);
//     if (req.isAuthenticated()) {
//         res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
//     } else {
//         res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
//     }
// });
// app.get('/logout', (req, res, next) => {
//     req.logout();
//     res.redirect('/protected-route');
// });
// app.get('/login-success', (req, res, next) => {
//     res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
// });
// app.get('/login-failure', (req, res, next) => {
//     res.send('You entered the wrong password.');
// });
// app.listen(3000);