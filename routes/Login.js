const express = require('express');
const router = express.Router();

//# CUSTOM MODULES
const emailValid = require('../modules/emailValidation.js');
const passport = require("passport");

//# Models
const User = require("../models/Users");


router.post('/Login', async function(req, res) {
    try {

        if (!(typeof req.body.email === "string" &&
                typeof req.body.pass === "string"
            )) {
            return res.status(500).send({
                status: 500,
                message: 'Invalid Login Data',
                type: 'internal'
            })
        }

        let email = req.body.email.trim();
        let pass = req.body.pass.trim();


        // #Validation inputs

        if (!(email.length > 3 && email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(pass.length > 3 && pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!emailValid.emailValidate(email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end

        const CheckEgxists = await User.find({
            pass: pass,
            email: email,
            deleted: false
        });

        if (CheckEgxists.length === 1) {
            passport.authenticate('local', { failureFlash: 'Invalid authentification' });
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    return res.status(400).send({
                        status: 400,
                        message: 'Passport authentification failed.',
                        type: 'internal'
                    });
                }
                if (user) {
                    req.logIn(user, function(err) {
                        if (err) {
                            return res.status(400).send({
                                status: 400,
                                message: 'Login failed.',
                                type: 'internal'
                            });
                        }
                        return res.status(202).json({
                            message: 'Login OK',
                            error: false
                        });
                    });

                } else {
                    return res.status(400).send({
                        status: 400,
                        message: 'Login failed.',
                        type: 'internal'
                    });
                }
            })(req, res);
        } else {
            return res.status(400).send({
                status: 400,
                message: 'No User with such login data.',
                type: 'internal'
            });
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Invalid Login Data',
            code: "invalid_input",
            type: 'internal'
        });
    }
});


module.exports = router;