const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passwordLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    Title: {
        type: String,
        required: true
    },


    Board: {
        type: String,
        required: true
    },

    Code: {
        type: Number,
        required: true
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
        required: true
    },

    Contact: {
        type: Number,
        required: true
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

userSchema.plugin(passwordLocalMongoose);

module.exports = mongoose.model("User" , userSchema);