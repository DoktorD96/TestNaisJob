var express = require('express');
var router = express.Router();

//# CUSTOM MODULES
var middleWare = require('../modules/MiddleWare.js');

//# Models
const Note = require("../models/Notes");

router.post('/NoteDelete', middleWare.middleWare, async function(req, res) {
    try {

        if (typeof req.body.id === "string" && req.body.id.trim().length > 0) {

            if (parseInt(req.body.id.trim()) > 99999) {
                return res.status(500).send({
                    status: 500,
                    message: 'NoteID is too Large Number.',
                    type: 'internal'
                });
            }

            if (parseInt(req.body.id.trim()) < 1) {
                return res.status(500).send({
                    status: 500,
                    message: 'NoteID can\'t be 0 or less.',
                    type: 'internal'
                });
            }

            const CheckNoteEgxists = await Note.count({
                "userid": req.session.passport.user,
                "increment": parseInt(req.body.id.trim()),
                "deleted": false
            });

            if (CheckNoteEgxists == 0) {
                return res.status(500).send({
                    status: 500,
                    message: 'This note does not egxists.',
                    type: 'internal'
                });
            }

            try {
                // a document instance
                Note.find({
                    userid: req.session.passport.user,
                    increment: parseInt(req.body.id.trim()),
                    deleted: false
                }, function(err, notes) {
                    try {
                        if (err) {
                            return res.status(500).send({
                                status: 500,
                                message: 'Delete Note Failed',
                                type: 'internal'
                            });
                        }
                        notes[0].deleted = true;
                        // save model to database
                        notes[0].save(function(err, user) {
                            if (err) {
                                return res.status(500).send({
                                    status: 500,
                                    message: 'Delete Note Failed',
                                    type: 'internal'
                                });
                            }
                            return res.status(202).json({ message: 'Delete Note OK', error: false });
                        });
                    } catch (e) {
                        return res.status(500).send({
                            status: 500,
                            message: 'Delete Note Failed',
                            type: 'internal'
                        });
                    }
                });
            } catch (e) {
                return res.status(500).send({
                    status: 500,
                    message: 'Delete Note Failed',
                    type: 'internal'
                });
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
            message: 'Note Delete Failed.',
            type: 'internal'
        });
    }
});


module.exports = router;