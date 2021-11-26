const express = require('express');
const router = express.Router();

//# Models
const Note = require("../models/Notes");

require('dotenv').config();

const CRONJOB_GETAUTH = process.env.CRONJOB_GETAUTH;

router.get('/CronDeleteNotes', async function(req, res) {
    try {

        if (req.query.auth === CRONJOB_GETAUTH) {

            const query = {
                deleted: true
            };

            const DeletedNotes = await Note.find(query);

            if (DeletedNotes.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Notes to delete.',
                });
            }

            const result = await Note.deleteMany(query);

            if (result.deletedCount > 0) {
                return res.status(202).send({
                    status: 202,
                    deletedNotes: DeletedNotes,
                    message: 'Notes Sucessfully Deleted.'
                });
            } else {
                return res.status(500).send({
                    status: 500,
                    message: 'Delete Notes Operation Failed.',
                    type: 'internal'
                });
            }

        } else {
            return res.status(500).send({
                status: 500,
                message: 'Delete Notes Authentification Failed.',
                type: 'internal'
            });
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Delete Notes Failed.',
            type: 'internal'
        });
    }
});

module.exports = router;