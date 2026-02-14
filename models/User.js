const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    Title: {
        type: String,
        required: true,
        unique: true
    },


    Board: {
        type: String,
        required: true
    },

    Code: {
        type: Number,
        required: true,
        unique: true
    },

    City: {
        type: String,
        required: true
    },

    State: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true

    },

    Contact: {
        type: Number,
        required: true,
        unique: true
    },

    adminName: {
        type: String,
        required: true
    },

    adminEmail: {
        type: String,
        required: true
    },

    adminContact: {
        type: Number,
        required: true
    }


})

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model("User", userSchema);