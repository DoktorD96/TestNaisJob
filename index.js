// #MODULES REQUIRE

const express = require('express');
const session = require('express-session');
const MongoDbStore = require('connect-mongo');
const multer = require('multer'); // mutlipart form data

const upload = multer();
const routes = require('./routes');

require('./config/database.js'); //connect to DB
require('dotenv').config();


// EXPRESS.JS GLOBAL APP VARIABLE
const app = express();

const passport = require("passport");

// Session Config
app.use(
    session({
        secret: 'story book',
        resave: false,
        saveUninitialized: false,
        store: MongoDbStore.create({ mongoUrl: process.env.MONGODBURI, collectionName: 'sessions' })
    })
);





// #SUPPORT FOR:
// application/x-www-form-urlencoded
// application/json
// multipart/form-data
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(upload.array());

require('./config/passport');

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);


/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000, () => {
    console.log(`App listening at http://localhost:3000`)
});