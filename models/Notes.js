const mongoose = require("mongoose");


// Create Schema
const NoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    text: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 500,
        trim: true
    },
    userid: {
        type: String,
        required: true,
        minLength: 24,
        maxLength: 24,
        trim: true
    },
    created: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 10,
        trim: true,
        default: function() {
            return new Date().toISOString().substr(0, 10);
        }
    },
    created_milis: {
        type: Number,
        min: 1000000000000,
        required: true,
        default: function() {
            return new Date().getTime();
        }
    },
    created_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    sent: {
        type: Boolean,
        required: true,
        default: false
    },
    time: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 10,
        trim: true
    },
    time_milis: {
        type: Number,
        min: 1000000000000,
        required: true
    },
    time_date: {
        type: Date,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    increment: {
        type: Number,
        required: true,
        min: 1,
        max: 9999
    }
}, { strict: false });

module.exports = Note = mongoose.model("notes", NoteSchema);