var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');
var middleWare = require('../modules/MiddleWare.js');
require('dotenv').config();

var CRONJOB_GETAUTH = process.env.CRONJOB_GETAUTH;

router.get('/CronDeleteNotes', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {
            var DB = await mongoUtil.connectToServer();
            const query = {
                deleted: true
            };
            const DeletedNotes = await DB.notes.find(query).toArray();
            if (DeletedNotes.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Notes do delete',
                });
            }
            const result = await DB.notes.deleteMany(query);
            if (result.deletedCount > 0) {
                return res.status(202).send({
                    status: 202,
                    deletedNotes: DeletedNotes,
                    message: 'Notes Sucessfully Deleted.'
                });
            } else {
                return res.status(500).send({
                    status: 500,
                    message: 'Delete Notes Operation Failed',
                    type: 'internal'
                });
            }
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Delete Notes Authentification Failed',
                type: 'internal'
            });
        }
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Delete Notes Failed',
            type: 'internal'
        });
    }
});



module.exports = router;