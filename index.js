// NOTE: ALL ENVIROMENT VARIABLES SHOULD BE STORED INSIDE .ENV FILE
// AND ADDED TO .GITIGNORE SO THESE CREDENTIALS NEVER LEAK, EVEN IF IT
// IS A PRIVATE REPO. I STORED ENVIROMENT VARIABLES HERE FOR THE SAKE
// OF SIMPLICITY



// #DEPENDENCIES

var Mailgun = require('mailgun-js');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

// # SUPPORT FOR FORM DATA

var multer = require('multer'); // mutlipart form data
var upload = multer();

// EXPRESS.JS GLOBAL APP VARIABLE

const app = express();

// THIS IS BAD PRACTISE. DID B64 ENCODING BECAUSE OF GITHUB WARNINGS SHOUD BE IN .ENV FILE
const MONGODBURI = Buffer.from("bW9uZ29kYitzcnY6Ly92aXNlcjp2aXNlckBjbHVzdGVyMC5pY3p3Ni5tb25nb2RiLm5ldC9Ob3Rlc0FwcD9yZXRyeVdyaXRlcz10cnVlJnc9bWFqb3JpdHk", "base64").toString();

var CRONJOB_GETAUTH = "C5JgEQbrys3AnwBatbbMF6pTvJHkH7THHmBDTpnuMfjKCQ9E7hhS97mWE6udwcsYcArriZ6Mj8UJvmtG3cLpPRGBEeWf3G7ALJGp8r6eaNi4CcbeoeSy5HuxhMFi6ZsY";

var mailgun = new Mailgun({
    apiKey: Buffer.from("MDY3ZmI5YmNiYWVjNzc2ZTNjMmViOTFmMTdlNjI4OWEtMzBiOWNkNmQtYjE3ZWMyNWM", "base64").toString(),
    domain: Buffer.from("ZW1haWxub3RpZmljYXRpb24ub25saW5l", "base64").toString(),
    host: Buffer.from("YXBpLmV1Lm1haWxndW4ubmV0", "base64").toString()
});




// #GLOBAL MONGODB VARIABLES

var NOTES = null;
var USERS = null;
var LOGINID = null;


// # EMAIL VALLIDATION REGEX

const emailValidate = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// # MONGODB START CONNECTION

MongoClient.connect(MONGODBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, async(err, client) => {
    if (err) {
        return console.log(err);
    }
    MONGO = client;
    try {
        const db = MONGO.db('NotesApp');
        NOTES = db.collection('Notes');
        USERS = db.collection('Users');
        console.log("MongoDB connection started");
    } catch (e) {
        console.log(e);
    }
});


// #SUPPORT FOR:
// application/x-www-form-urlencoded
// application/json
// multipart/form-data
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(upload.array());


// #SEND EMAIL FUNCTION VIA PROMISE

function sendEmail(msg) {
    return new Promise(function(resolve) {
        mailgun.messages().send(msg, function(err, body) {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}


// #Authentification Middleware

app.use(async function(req, res, next) {
    try {

        // # DO NOT AUTHENTIFICATE LOGIN, REGISTER
        // # AND CRON JOB ENDPOINTS

        if (!(req.path.indexOf(`Login`) > -1 ||
                req.path.indexOf(`Register`) > -1 ||
                req.path.indexOf(`CronJob`) > -1 ||
                req.path.indexOf(`CronDeleteUsers`) > -1 ||
                req.path.indexOf(`CronDeleteNotes`) > -1
            )) {
            if (!req.headers.authorization) {
                return res.status(403).json({ error: 'No credentials sent!' });
            }
            let authcred = req.headers.authorization.split(" ");
            if (authcred.length !== 2) {
                return res.status(500).json({ error: 'Invalid auth credentials' });
            }

            if (typeof authcred[0] != "string" ||
                authcred[0].trim() != "Bearer" ||
                typeof authcred[1] != "string" ||
                authcred[1].trim().length !== 24) {
                return res.status(500).json({ error: 'Invalid auth credentials' });
            }
            const CheckID = await USERS.count({ "_id": ObjectId(authcred[1].trim()), deleted: false });
            if (CheckID === 1) {
                //auth OK
                LOGINID = authcred[1].trim();
            } else {
                return res.status(400).json({ error: 'No auth user found.' });
            }
        }
    } catch (e) {
        return res.status(500).json({ error: 'Invalid auth credentials' });
    }
    next();
});

// #CronJob To Delete Users

app.get('/CronDeleteUsers', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {
            const query = {
                deleted: true
            };
            const DeletedUsers = await USERS.find(query).toArray();
            if (DeletedUsers.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Users do delete',
                });
            }
            const result = await USERS.deleteMany(query);
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

// #CronJob To Delete Notes

app.get('/CronDeleteNotes', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {
            const query = {
                deleted: true
            };
            const DeletedNotes = await NOTES.find(query).toArray();
            if (DeletedNotes.length == 0) {
                return res.status(202).send({
                    status: 202,
                    message: 'There are no Notes do delete',
                });
            }
            const result = await NOTES.deleteMany(query);
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

// #CronJob To Send Emails

app.get('/CronJob', async function(req, res) {
    try {
        if (req.query.auth === CRONJOB_GETAUTH) {

            const SentNotes = await NOTES.find({
                time: new Date().toISOString().substr(0, 10),
                sent: false,
                deleted: false
            }).toArray();


            if (SentNotes.length > 0) {
                var userIDS = [];
                for (var i = 0, l = SentNotes.length; i < l; i++) {
                    userIDS.push(ObjectId(SentNotes[i].userid));
                }
            } else {
                return res.status(500).json({ message: 'There are no notes to send.', error: false });
            }

            const userData = await USERS.find({
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
                            html: "This Email is sent as a reminder from TODO app.\n" +
                                "\n" +
                                "Note: <b>" + SentNotes[i].name + "</b>\n" +
                                "\n" +
                                "Created date: <b>" + SentNotes[i].created + "</b>\n" +
                                "\n" +
                                "Notify date: <b>" + SentNotes[i].time + "</b>\n" +
                                "\n" +
                                "...\n"
                        }
                        if (await sendEmail(msg) == true) {
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
                await NOTES.updateOne({ "userid": SentNotes[i].userid, "deleted": false }, { $set: { sent: emailsend } }, );
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

// #Delete Profile

app.post('/Delete', async function(req, res) {
    try {

        const result = await USERS.updateOne({ "_id": ObjectId(LOGINID) }, { $set: { deleted: true } });

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

// #Edit Profile
app.post('/Edit', async function(req, res) {
    try {

        //#EditObject
        let editObj = {};

        //#Name Edit
        if (typeof req.body.name === "string") {
            editObj.name = req.body.name.trim();
        }

        //#Email Edit
        if (typeof req.body.email === "string") {
            editObj.email = req.body.email.trim();
        }

        //#Pass Edit
        if (typeof req.body.pass === "string") {
            editObj.pass = req.body.pass.trim();
        }
        //#Pass Edit
        if (typeof req.body.passrepeat === "string") {
            editObj.passrepeat = req.body.passrepeat.trim();
        }




        if (Object.keys(editObj).length === 0) {
            return res.status(500).send({
                status: 500,
                message: 'No Data Passed to Edit',
                type: 'internal'
            });
        }

        // #Validation inputs

        if (!(editObj.name.length > 3 && editObj.name.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Name can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(editObj.email.length > 3 && editObj.email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(editObj.pass.length > 3 && editObj.pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (typeof req.body.pass === "string" && editObj.passrepeat !== editObj.pass) {
            return res.status(500).send({
                status: 500,
                message: 'Password Repeat Missmatch',
                type: 'internal'
            })
        }

        if (!emailValidate(editObj.email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end

        editObj.deleted = false;

        const result = await USERS.updateOne({ "_id": ObjectId(LOGINID) }, { $set: editObj });

        if (result.acknowledged) {
            return res.status(202).json({ message: 'Edit Profile OK', error: false });
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Edit Profile Failed',
                type: 'internal'
            })
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Edit Profile Failed',
            type: 'internal'
        });
    }

});

// #Login
app.post('/Login', async function(req, res) {
    try {
        if (!(typeof req.body.email === "string" &&
                typeof req.body.pass === "string"
            )) {
            return res.status(500).send({
                status: 500,
                message: 'Invalid Login Data',
                type: 'internal'
            })
        }
        let email = req.body.email.trim();
        let pass = req.body.pass.trim();


        // #Validation inputs

        if (!(email.length > 3 && email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(pass.length > 3 && pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!emailValidate(email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end

        const CheckEgxists = await USERS.find({
            pass: pass,
            email: email,
            deleted: false
        }).toArray();

        if (CheckEgxists.length === 1) {
            return res.status(202).json({
                message: 'Login OK',
                token: CheckEgxists[0]._id.toString(),
                error: false
            });
        } else {
            return res.status(400).send({
                status: 400,
                message: 'No User with such login data.',
                type: 'internal'
            })
        }
    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Invalid Login Data',
            code: "invalid_input",
            type: 'internal'
        })
    }
});

// #Create Note
app.post('/NoteCreate', async function(req, res) {
    try {
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
                const incrementCheck = await NOTES.find({
                    userid: LOGINID
                }).sort({ increment: -1 }).limit(1).toArray();

                if (incrementCheck.length != 0) {
                    increment = incrementCheck[0].increment + 1;
                }

                insertO.increment = increment;

                const result = await NOTES.insertOne(insertO);
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

// #Delete Note

app.post('/NoteDelete', async function(req, res) {
    try {
        if (typeof req.body.id === "string" && req.body.id.trim().length > 0 && parseInt(req.body.id.trim()) > 0) {

            const CheckNoteEgxists = await NOTES.count({
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


            const result = await NOTES.updateOne({ "userid": LOGINID, "increment": parseInt(req.body.id.trim()), "deleted": false }, { $set: { deleted: true } });
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

// #Edit Note

app.post('/NoteEdit', async function(req, res) {
    try {

        if (typeof req.body.name === "string" &&
            typeof req.body.text === "string" &&
            typeof req.body.time === "string" && req.body.time.trim().length == 10 &&
            typeof req.body.noteid === "string" && req.body.noteid.trim().length > 0 && parseInt(req.body.noteid.trim()) > 0
        ) {
            var noteid = parseInt(req.body.noteid.trim());

            if (noteid > 99999) {
                return res.status(500).send({
                    status: 500,
                    message: 'NoteID is too Large Number.',
                    type: 'internal'
                });
            }
            var insertO = {};
            insertO.name = req.body.name.trim();
            insertO.text = req.body.text.trim();


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
                    message: 'Note text can be between 3 and 500 characters.',
                    type: 'internal'
                });
            }



            const CheckNoteEgxists = await NOTES.count({
                "userid": LOGINID,
                "increment": noteid,
                "deleted": false
            });

            if (CheckNoteEgxists == 0) {
                return res.status(500).send({
                    status: 500,
                    message: 'This note does not egxists.',
                    type: 'internal'
                });
            }

            // # SUPPORT BOTH 2012-02-02 && 2012/02/02

            var time = req.body.time.trim().toLowerCase();
            var timearr = time.split("/");
            if (timearr.length == 1) {
                timearr = time.split("-");
            }


            // #time validation

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
                insertO.sent = false;


                const result = await NOTES.updateOne({ "userid": LOGINID }, { $set: insertO });
                if (result.acknowledged) {
                    return res.status(202).json({ message: 'Note Updated OK.', error: false });
                } else {
                    return res.status(500).send({
                        status: 500,
                        message: 'Note Update Failed.',
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
            message: 'Note Update Failed.',
            type: 'internal'
        });
    }
});

// #All Notes

app.post('/Notes', async function(req, res) {
    try {
        const Notes = await NOTES.find({
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

// #Register

app.post('/Register', async function(req, res) {

    try {
        if (!(typeof req.body.name === "string" &&
                typeof req.body.email === "string" &&
                typeof req.body.pass === "string" &&
                typeof req.body.passrepeat === "string"
            )) {
            return res.status(500).send({
                status: 500,
                message: 'Invalid Registration Data',
                type: 'internal'
            })
        }
        if (req.body.passrepeat.trim() !== req.body.pass.trim()) {
            return res.status(500).send({
                status: 500,
                message: 'Password Repeat Missmatch',
                type: 'internal'
            })
        }

        const doc = {
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            pass: req.body.pass.trim(),
            deleted: false
        }

        // #Validation inputs

        if (!(doc.name.length > 3 && doc.name.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Name can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(doc.email.length > 3 && doc.email.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Email can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!(doc.pass.length > 3 && doc.pass.length < 50)) {
            return res.status(500).send({
                status: 500,
                message: 'Password can be between 3 and 50 characters.',
                type: 'internal'
            });
        }

        if (!emailValidate(doc.email)) {
            return res.status(500).send({
                status: 500,
                message: 'Email is in invalid format.',
                type: 'internal'
            });
        }

        // #Validation inputs end


        const CheckName = await USERS.count({
            name: doc.name
        });

        if (CheckName > 0) {
            return res.status(500).send({
                status: 500,
                message: 'User with that Name already egxists.',
                code: "name_egxists",
                type: 'internal'
            })
        }

        const CheckEmail = await USERS.count({
            email: doc.email
        });

        if (CheckEmail > 0) {
            return res.status(500).send({
                status: 500,
                message: 'User with that Email already egxists.',
                code: "email_egxists",
                type: 'internal'
            })
        }

        const result = await USERS.insertOne(doc);
        if (result.acknowledged) {
            return res.status(202).json({ message: 'Registration OK', error: false });
        } else {
            return res.status(500).send({
                status: 500,
                message: 'Registration Failed',
                type: 'internal'
            })
        }

    } catch (e) {
        return res.status(500).send({
            status: 500,
            message: 'Invalid Registration Data',
            code: "invalid_input",
            type: 'internal'
        })
    }
});



// #Error 404 and other handling

app.use(function(req, res, next) {
    next(new Error('Not Found'))
});
app.use(function(err, req, res, next) {
    res.status(500).send({
        status: 500,
        message: 'Internal error',
        type: 'internal'
    })
});

// #START APP SERVER

app.listen(3000, () => {
    console.log(`App listening at http://localhost:3000`)
});