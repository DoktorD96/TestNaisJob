const express = require('express');
const router = express.Router();

//# CUSTOM MODULES
const sendEmail = require('../modules/sendEmail.js');
const Notes = require('../models/Notes');

require('dotenv').config();

const CRONJOB_GETAUTH = process.env.CRONJOB_GETAUTH;

router.get('/CronJob', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {

            const SentNotes = await Notes.find({
                time: new Date().toISOString().substr(0, 10),
                sent: false,
                deleted: false
            });


            if (SentNotes.length > 0) {
                var userIDS = [];
                for (var i = 0, l = SentNotes.length; i < l; i++) {
                    userIDS.push(ObjectId(SentNotes[i].userid));
                }
            } else {
                return res.status(500).json({ message: 'There are no notes to send.', error: false });
            }

            const userData = await DB.users.find({
                _id: {
                    $in: userIDS
                },
                deleted: false
            }).toArray();


            if (userData.length > 0) {
                var emails = [];
                var emailids = [];
                for (var i = 0, l = userData.length; i < l; i++) {
                    emailids.push(userData[i]._id.toString());
                    emails.push(userData[i].email);
                }
            } else {
                return res.status(202).json({ message: 'There are no associated users for email sending.', error: false });
            }

            //sending emails

            for (var i = 0, l = SentNotes.length; i < l; i++) {
                var emailsend = false;
                try {
                    var emailid = emailids.indexOf(SentNotes[i].userid);
                    if (emailid > -1) {
                        var email = emails[emailid];
                        var msg = {
                            from: 'TODO APP REMINDER <noreply@emailnotification.online>',
                            to: email,
                            subject: `Note reminder: ${SentNotes[i].name}`,
                            html: "This Email is sent as a reminder from TODO app.<br/>" +
                                "<br/>" +
                                "Note: <b>" + SentNotes[i].name + "</b><br/>" +
                                "<br/>" +
                                "Created date: <b>" + SentNotes[i].created + "</b><br/>" +
                                "<br/>" +
                                "Notify date: <b>" + SentNotes[i].time + "</b><br/>" +
                                "<br/>" +
                                "...<br/>"
                        }
                        if (await sendEmail.emailSend(msg) == true) {
                            emailsend = true;
                            console.log("Email sent.");
                        } else {
                            emailsend = false;
                        }

                    }
                } catch (e) {
                    console.log(e);
                }

                // update email send status
                await NOTES.updateOne({
                    userid: SentNotes[i].userid,
                    increment: SentNotes[i].increment,
                    deleted: false
                }, { $set: { sent: emailsend } });

                try {
                    // a document instance
                    Notes.findOne({
                        increment: noteid,
                        userid: req.session.passport.user,
                        deleted: false
                    }, function(err, note) {
                        try {
                            if (!err) {
                                note.sent = emailsend;
                                // save model to database
                                note.save();
                            }
                        } catch (e) {}
                    });
                } catch (e) {}

            }

            return res.status(202).json({ message: 'Emails Sent OK.', error: false });

        } else {

            return res.status(500).send({
                status: 500,
                message: 'Send Emails Authentification Failed',
                type: 'internal'
            });
        }
    } catch (e) {

        return res.status(500).send({
            status: 500,
            message: 'Email Sending Failed',
            type: 'internal'
        });
    }
});


module.exports = router;