var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');

const middleWare = async(req, res, next) => {
    try {

        //passport.authenticate('local', { failureFlash: 'Invalid authentification' });
        console.log(req.session);
        console.log(req.isAuthenticated());
        if (!req.headers.authorization) {
            return res.status(403).json({ error: 'No credentials sent!' });
        }
        let authcred = req.headers.authorization.split(" ");
        if (authcred.length !== 2) {
            return res.status(500).json({ error: 'Invalid auth credentials' });
        }

        if (typeof authcred[0] != "string" ||
            authcred[0].trim() != "Bearer" ||
            typeof authcred[1] != "string" ||
            authcred[1].trim().length !== 24) {
            return res.status(500).json({ error: 'Invalid auth credentials' });
        }
        const CheckID = await DB.users.count({ "_id": ObjectId(authcred[1].trim()), deleted: false });
        if (CheckID === 1) {
            //auth OK
            LOGINID = authcred[1].trim();
        } else {
            return res.status(400).json({ error: 'No auth user found.' });
        }

    } catch (e) {
        return res.status(500).json({ error: 'Invalid auth credentials' });
    }
    next();
}

module.exports = {
    middleWare: middleWare
}