var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var middleWare = require('../modules/MiddleWare.js');
//# Models
const User = require("../models/Users");


router.post('/Delete', middleWare.middleWare, async function(req, res) {
    try {
        User.findByIdAndUpdate(req.session.passport.user, { deleted: true }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 500,
                    message: 'Delete Profile Failed',
                    type: 'internal'
                })
            };
            return res.status(202).json({ message: 'Delete Profile OK', error: false });
        });
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Delete Profile Failed',
            type: 'internal'
        });
    }
});

module.exports = router;