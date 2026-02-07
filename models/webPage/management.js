const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = require('../User');


const managementSchema = new Schema({
    member: [
        {
            Role: String,
            Name: String,
            age: Number,
            Gender: String,
            Qualification: String,
            photo: {
                filename: String,
                url: String
            },
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Management", managementSchema);