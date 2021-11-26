const mongoose = require("mongoose");


// Create Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
            //match: regex email validation
    },
    pass: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
}, { strict: false });

module.exports = User = mongoose.model("users", UserSchema);