var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var middleWare = require('../modules/MiddleWare.js');
//# Models
const User = require("../models/Users");




router.post('/Delete', middleWare.middleWare, async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        const result = await DB.users.updateOne({ "_id": ObjectId(LOGINID) }, { $set: { deleted: true } });
        if (result.acknowledged) {
            return res.status(202).json({ message: 'Delete Profile OK', error: false });
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Delete Profile Failed',
                type: 'internal'
            })
        }
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Delete Profile Failed',
            type: 'internal'
        });
    }
});

module.exports = router;