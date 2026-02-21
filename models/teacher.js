const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

let teacherSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    photo: {
        url: String,
        filename: String
    },

    contact: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

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

    pinCode: {
        type: Number,
        required: true
    },

    teacherId: {
        type: String,
        required: true,
        unique: true
    },

    joiningDate: {
        type: Date,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    role: {
        type: String,

    },

    subject: {
        type: String,
        required: true
    },
    account: {
        type: String,
        required: true
    },

    IFSC: {
        type: String,
        required: true
    },

    salary: {
        inhand: {
            type: Number,
            required: true,
            default: 0
        },
        epf: {
            type: Number,
            required: true
        },
        others: {
            type: Number,
            required: true,
            default: 0
        },
        total: {
            type: Number,
            required: true,
            default: 0
        }
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

})

module.exports = mongoose.model("Teacher", teacherSchema);

