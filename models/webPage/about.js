const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = require('../User');


let aboutSchema = new Schema({
    aboutBrief: String,
    about: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("About" , aboutSchema);