var express = require('express');
var router = express.Router();

//# CUSTOM MODULES
var middleWare = require('../modules/MiddleWare.js');

//# Models
const Note = require("../models/Notes");

router.post('/NoteEdit', middleWare.middleWare, async function(req, res) {
    try {

        if (typeof req.body.name === "string" &&
            typeof req.body.text === "string" &&
            typeof req.body.time === "string" && req.body.time.trim().length == 10 &&
            typeof req.body.noteid === "string" && req.body.noteid.trim().length > 0 && parseInt(req.body.noteid.trim()) > 0
        ) {

            var noteid = parseInt(req.body.noteid.trim());

            if (noteid > 99999) {
                return res.status(500).send({
                    status: 500,
                    message: 'NoteID is too Large Number.',
                    type: 'internal'
                });
            }

            if (noteid < 1) {
                return res.status(500).send({
                    status: 500,
                    message: 'NoteID can\'t be 0 or less.',
                    type: 'internal'
                });
            }

            var insertO = {};
            insertO.name = req.body.name.trim();
            insertO.text = req.body.text.trim();


            if (!(insertO.name.length > 3 && insertO.name.length < 50)) {
                return res.status(500).send({
                    status: 500,
                    message: 'Name can be between 3 and 50 characters.',
                    type: 'internal'
                });
            }

            if (!(insertO.text.length > 3 && insertO.text.length < 500)) {
                return res.status(500).send({
                    status: 500,
                    message: 'Note text can be between 3 and 500 characters.',
                    type: 'internal'
                });
            }



            const CheckNoteEgxists = await Note.count({
                "userid": req.session.passport.user,
                "increment": noteid,
                "deleted": false
            });

            if (CheckNoteEgxists == 0) {
                return res.status(500).send({
                    status: 500,
                    message: 'This note does not egxists.',
                    type: 'internal'
                });
            }

            // # SUPPORT BOTH 2012-02-02 && 2012/02/02

            var time = req.body.time.trim().toLowerCase();
            var timearr = time.split("/");
            if (timearr.length == 1) {
                timearr = time.split("-");
            }


            // #time validation

            if (timearr.length == 3 && parseInt(timearr[0]) > 2020 && parseInt(timearr[0]) < 2050 &&
                parseInt(timearr[1]) > 0 && parseInt(timearr[1]) < 13 && parseInt(timearr[2]) > 0 && parseInt(timearr[2]) < 32) {

                var datestring = parseInt(timearr[0]); // year
                if (parseInt(timearr[1]) > 9) {
                    datestring = datestring + "-" + parseInt(timearr[1]);
                } else {
                    datestring = datestring + "-0" + parseInt(timearr[1]);
                }
                if (parseInt(timearr[2]) > 9) {
                    datestring = datestring + "-" + parseInt(timearr[2]);
                } else {
                    datestring = datestring + "-0" + parseInt(timearr[2]);
                }


                insertO.time = datestring;
                insertO.time_milis = new Date(datestring).getTime();
                insertO.time_date = new Date(datestring);
                insertO.deleted = false;
                insertO.sent = false;

                try {
                    // a document instance
                    Note.find({
                        increment: noteid,
                        userid: req.session.passport.user,
                        deleted: false
                    }, function(err, notes) {
                        try {
                            if (err) {
                                return res.status(500).send({
                                    status: 500,
                                    message: 'Note Update Failed.',
                                    type: 'internal'
                                });
                            }
                            for (var key in insertO) {
                                if (insertO.hasOwnProperty(key)) {
                                    notes[0][key] = insertO[key];
                                }
                            }
                            // save model to database
                            notes[0].save(function(err, user) {
                                if (err) {
                                    return res.status(500).send({
                                        status: 500,
                                        message: 'Note Update Failed.',
                                        type: 'internal'
                                    });
                                }
                                return res.status(202).json({ message: 'Note Updated OK.', error: false });
                            });
                        } catch (e) {
                            return res.status(500).send({
                                status: 500,
                                message: 'Note Update Failed.',
                                type: 'internal'
                            });
                        }
                    });
                } catch (e) {
                    return res.status(500).send({
                        status: 500,
                        message: 'Note Update Failed.',
                        type: 'internal'
                    });
                }

            } else {
                return res.status(500).send({
                    status: 500,
                    message: 'Date is in Invalid format.',
                    type: 'internal'
                })
            }
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Missing or invalid fields.',
                type: 'internal'
            });
        }


    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Note Update Failed.',
            type: 'internal'
        });
    }
});


module.exports = router;