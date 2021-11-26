var express = require('express');
var router = express.Router();
//# CUSTOM MODULES

var middleWare = require('../modules/MiddleWare.js');
//# Models
const Note = require("../models/Notes");

router.post('/Notes', middleWare.middleWare, async function(req, res) {
    try {
        const Notes = await Note.find({
            userid: req.session.passport.user,
            deleted: false,
        }, { _id: false, name: true, text: true, created: true, time: true, increment: true }).sort({ increment: 1 });
        return res.status(202).json({ message: 'Retrieve Notes OK', notes: Notes, error: false });
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Notes Fetch Failed.',
            type: 'internal'
        });
    }
});

module.exports = router;