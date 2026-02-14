const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User")

const studentSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    class: {
        type: Number,
        required: true
    },

    sec: {
        type: String,
        required: true,
        default: "A"
    },

    dob: {
        type: Date,
        required: true
    },

    contact: {
        type: Number,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    registrationNo: {
        type: Number,
        required: true
    },

    rollNo: {
        type: Number,
        required: true
    },

    admissionDate: Date,

    Address: {
        type: String,
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

    fatherName: {
        type: String,
        required: true
    },

    gaurdianContact: {
        type: Number,
        required: true
    },

    motherName: {
        type: String,
        required: true
    },

    category: String,

    school: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },


})

module.exports = mongoose.model("Student", studentSchema);