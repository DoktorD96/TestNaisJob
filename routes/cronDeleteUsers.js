var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');
require('dotenv').config();

var CRONJOB_GETAUTH = process.env.CRONJOB_GETAUTH;

router.get('/CronDeleteUsers', async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        if (req.query.auth === CRONJOB_GETAUTH) {
            const query = {
                deleted: true
            };
            const DeletedUsers = await DB.users.find(query).toArray();
            if (DeletedUsers.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Users do delete',
                });
            }
            const result = await DB.users.deleteMany(query);
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
        console.log(e);
        return res.status(500).send({
            status: 500,
            message: 'Delete Users Failed',
            type: 'internal'
        });
    }
});


module.exports = router;