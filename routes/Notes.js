var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');
var middleWare = require('../modules/MiddleWare.js');
router.post('/Notes', middleWare.middleWare, async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        const Notes = await DB.notes.find({
            userid: LOGINID,
            deleted: false,
        }, {
            projection: { _id: false, name: true, text: true, created: true, time: true, increment: true }
        }).sort({ increment: 1 }).toArray();

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