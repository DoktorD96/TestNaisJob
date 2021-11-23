require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODBURI;

var NOTES = null;
var USERS = null;

var _db;

module.exports = {
    connectToServer: function() {
        return new Promise(function(resolve) {
            if (NOTES == null || USERS == null) {
                MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        resolve(false);
                        return console.log(err);
                    }
                    var MONGO = client;
                    try {
                        const db = MONGO.db('NotesApp');
                        NOTES = db.collection('Notes');
                        USERS = db.collection('Users');
                        console.log("MongoDB connection started");
                        resolve({ notes: NOTES, users: USERS });
                    } catch (e) {
                        resolve(false);
                        console.log(e);
                    }
                });
            } else {
                resolve({ notes: NOTES, users: USERS });
            }
        });

    }
};