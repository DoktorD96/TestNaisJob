const express = require('express');
const router = express.Router();

//# Models
const User = require("../models/Users");

require('dotenv').config();

const CRONJOB_GETAUTH = process.env.CRONJOB_GETAUTH;

router.get('/CronDeleteUsers', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {

            const query = {
                deleted: true
            };

            const DeletedUsers = await User.find(query);

            if (DeletedUsers.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Users do delete',
                });
            }

            const result = await User.deleteMany(query);

            if (result.deletedCount > 0) {
                return res.status(202).send({
                    status: 202,
                    deletedUsers: DeletedUsers,
                    message: 'Users Sucessfully Deleted.'
                });
            } else {
                return res.status(500).send({
                    status: 500,
                    message: 'Delete Users Operation Failed',
                    type: 'internal'
                });
            }

        } else {
            return res.status(500).send({
                status: 500,
                message: 'Delete Users Authentification Failed',
                type: 'internal'
            });
        }
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Delete Users Failed',
            type: 'internal'
        });
    }
});


module.exports = router;