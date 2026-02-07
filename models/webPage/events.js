
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = require('../User');


const eventSchema = new Schema({
    event: [{
        Name: String,
        purpose: String,
        about: String,
        primaryPhoto: {
            filename: String,
            url: String
        },
        secondaryPhoto: {
            filename: String,
            url: String
        }
    }] ,

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Events" , eventSchema);