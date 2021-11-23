var express = require('express');
var router = express.Router();
//# CUSTOM MODULES
var mongoUtil = require('../modules/mongoUtil.js');
var middleWare = require('../modules/MiddleWare.js');


router.post('/NoteCreate', middleWare.middleWare, async function(req, res) {
    try {
        var DB = await mongoUtil.connectToServer();
        if (typeof req.body.name === "string" &&
            typeof req.body.text === "string" &&
            typeof req.body.time === "string" && req.body.time.trim().length == 10
        ) {

            var insertO = {};
            insertO.name = req.body.name.trim();
            insertO.text = req.body.text.trim();

            // #Validation inputs

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
                    message: 'Note text can between 3 and 500 characters.',
                    type: 'internal'
                });
            }

            // #Validation inputs end

            insertO.userid = LOGINID;
            insertO.created = new Date().toISOString().substr(0, 10);
            insertO.created_milis = new Date().getTime();
            insertO.created_date = new Date();
            insertO.sent = false;

            // # SUPPORT BOTH 2012-02-02 && 2012/02/02

            var time = req.body.time.trim().toLowerCase();
            var timearr = time.split("/");
            if (timearr.length == 1) {
                timearr = time.split("-");
            }

            // # time validation

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

                // using $inc will increment for all users.
                // I find this more suitable

                var increment = 1;
                const incrementCheck = await DB.notes.find({
                    userid: LOGINID
                }).sort({ increment: -1 }).limit(1).toArray();

                if (incrementCheck.length != 0) {
                    increment = incrementCheck[0].increment + 1;
                }

                insertO.increment = increment;

                const result = await DB.notes.insertOne(insertO);
                if (result.acknowledged) {
                    return res.status(202).json({ message: 'New Note Created.', error: false });
                } else {
                    return res.status(500).send({
                        status: 500,
                        message: 'Note Creation Failed.',
                        type: 'internal'
                    })
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
        console.log(e);
        return res.status(500).send({
            status: 500,
            message: 'Note Creation Failed.',
            type: 'internal'
        });
    }
});


module.exports = router;