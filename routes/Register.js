var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
const emailValid = require('../modules/emailValidation.js');
//# Models
const User = require("../models/Users");

router.post('/Register', async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        if (!(typeof req.body.name === "string" &&
                typeof req.body.email === "string" &&
                typeof req.body.pass === "string" &&
                typeof req.body.passrepeat === "string"
            )) {
            return res.status(500).send({
                status: 500,
                message: 'Invalid Registration Data',
                type: 'internal'
            })
        }
        if (req.body.passrepeat.trim() !== req.body.pass.trim()) {
            return res.status(500).send({
                status: 500,
                message: 'Password Repeat Missmatch',
                type: 'internal'
            })
        }

        const doc = {
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            pass: req.body.pass.trim(),
            deleted: false
        }

        // #Validation inputs

        if (!(doc.name.length > 3 && doc.name.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Name can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(doc.email.length > 3 && doc.email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(doc.pass.length > 3 && doc.pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!emailValid.emailValidate(doc.email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end


        const CheckName = await DB.users.count({
            name: doc.name
        });

        if (CheckName > 0) {
            return res.status(500).send({
                status: 500,
                message: 'User with that Name already egxists.',
                code: "name_egxists",
                type: 'internal'
            })
        }

        const CheckEmail = await DB.users.count({
            email: doc.email
        });

        if (CheckEmail > 0) {
            return res.status(500).send({
                status: 500,
                message: 'User with that Email already egxists.',
                code: "email_egxists",
                type: 'internal'
            })
        }

        const result = await DB.users.insertOne(doc);
        if (result.acknowledged) {
            return res.status(202).json({ message: 'Registration OK', error: false });
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Registration Failed',
                type: 'internal'
            })
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Invalid Registration Data',
            code: "invalid_input",
            type: 'internal'
        })
    }
});


module.exports = router;