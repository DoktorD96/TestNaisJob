var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
const emailValid = require('../modules/emailValidation.js');
const passport = require("passport");
//# Models
const User = require("../models/Users");

//var middleWare = require('../modules/MiddleWare.js');


router.post('/Login', passport.authenticate('local'), async function(req, res) {

    //passport.authenticate('local', {}), (err, req, res, next) => {
    return res.status(500).send({
        status: 500,
        message: 'Password can be between 3 and 50 characters.',
        type: 'internal'
    });
    //}
    //     try {
    //         if (!(typeof req.body.email === "string" &&
    //                 typeof req.body.pass === "string"
    //             )) {
    //             return res.status(500).send({
    //                 status: 500,
    //                 message: 'Invalid Login Data',
    //                 type: 'internal'
    //             })
    //         }
    //         let email = req.body.email.trim();
    //         let pass = req.body.pass.trim();


    //         // #Validation inputs

    //         if (!(email.length > 3 && email.length < 50)) {
    //             return res.status(500).send({
    //                 status: 500,
    //                 message: 'Email can be between 3 and 50 characters.',
    //                 type: 'internal'
    //             });
    //         }

    //         if (!(pass.length > 3 && pass.length < 50)) {
    //             return res.status(500).send({
    //                 status: 500,
    //                 message: 'Password can be between 3 and 50 characters.',
    //                 type: 'internal'
    //             });
    //         }

    //         if (!emailValid.emailValidate(email)) {
    //             return res.status(500).send({
    //                 status: 500,
    //                 message: 'Email is in invalid format.',
    //                 type: 'internal'
    //             });
    //         }

    //         // #Validation inputs end

    //         const CheckEgxists = await User.find({
    //             pass: pass,
    //             email: email,
    //             deleted: false
    //         });

    //         if (CheckEgxists.length === 1) {
    //             passport.authenticate('local', { failureFlash: 'Invalid authentification' });
    //             return res.status(202).json({
    //                 message: 'Login OK',
    //                 token: CheckEgxists[0]._id.toString(),
    //                 error: false
    //             });
    //         } else {
    //             return res.status(400).send({
    //                 status: 400,
    //                 message: 'No User with such login data.',
    //                 type: 'internal'
    //             });
    //         }
    //     } catch (e) {
    //         console.log(e);
    //         return res.status(500).send({
    //             status: 500,
    //             message: 'Invalid Login Data',
    //             code: "invalid_input",
    //             type: 'internal'
    //         })
    //     }
});


module.exports = router;