var express = require('express');
var router = express.Router();

//# CUSTOM MODULES
const emailValid = require('../modules/emailValidation.js');

//# Models
const User = require("../models/Users");

var middleWare = require('../modules/MiddleWare.js');

// #Edit Profile
router.post('/Edit', middleWare.middleWare, async function(req, res) {
    try {
        //#EditObject
        let editObj = {};

        //#Name Edit
        if (typeof req.body.name === "string") {
            editObj.name = req.body.name.trim();
        }

        //#Email Edit
        if (typeof req.body.email === "string") {
            editObj.email = req.body.email.trim();
        }

        //#Pass Edit
        if (typeof req.body.pass === "string") {
            editObj.pass = req.body.pass.trim();
        }
        //#Pass Edit
        if (typeof req.body.passrepeat === "string") {
            editObj.passrepeat = req.body.passrepeat.trim();
        }




        if (Object.keys(editObj).length === 0) {
            return res.status(500).send({
                status: 500,
                message: 'No Data Passed to Edit',
                type: 'internal'
            });
        }

        // #Validation inputs

        if (!(editObj.name.length > 3 && editObj.name.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Name can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(editObj.email.length > 3 && editObj.email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(editObj.pass.length > 3 && editObj.pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (typeof req.body.pass === "string" && editObj.passrepeat !== editObj.pass) {
            return res.status(500).send({
                status: 500,
                message: 'Password Repeat Missmatch',
                type: 'internal'
            })
        }

        if (!emailValid.emailValidate(editObj.email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end
        editObj.deleted = false;
        delete editObj.passrepeat;

        try {
            User.findByIdAndUpdate(req.session.passport.user, editObj, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        message: 'Edit Profile Failed',
                        type: 'internal'
                    })
                };
                return res.status(202).json({ message: 'Edit Profile OK', error: false });
            });
        } catch (e) {
            return res.status(500).send({
                status: 500,
                message: 'Edit Profile Failed',
                type: 'internal'
            })
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Edit Profile Failed',
            type: 'internal'
        });
    }

});


module.exports = router;