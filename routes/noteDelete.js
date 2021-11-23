var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');
var middleWare = require('../modules/MiddleWare.js');
router.post('/NoteDelete', middleWare.middleWare, async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        if (typeof req.body.id === "string" && req.body.id.trim().length > 0 && parseInt(req.body.id.trim()) > 0) {

            const CheckNoteEgxists = await DB.notes.count({
                "userid": LOGINID,
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


            const result = await DB.notes.updateOne({ "userid": LOGINID, "increment": parseInt(req.body.id.trim()), "deleted": false }, { $set: { deleted: true } });
            if (result.acknowledged) {
                return res.status(202).json({ message: 'Delete Note OK', error: false });
            } else {
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
        console.log(e);
        return res.status(500).send({
            status: 500,
            message: 'Note Delete Failed.',
            type: 'internal'
        });
    }
});


module.exports = router;