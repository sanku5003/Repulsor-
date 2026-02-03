const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('../models/User.js');

const webPageSchema = new Schema({
    Logo: {
        filename: String,
        url: String
    },

    Since: Number,
    Welcome: String,
    tagLine: String,
    firstDiv: Number,
    crakedJee: String,
    boardMerit: String,
    aboutUs: String,
    chairmanName: String,
    chairmanAge: Number,
    chairmanGender: String,
    chairmanQualification: String,
    chairmanPhoto: {
        filename: String,
        url: String
    },
    aboutChairman: {
        filename: String,
        url: String
    },
    principalName: String,
    principalAge: Number,
    principalGender: String,
    principalQualification: String,
    principalPhoto: {
        filename: String,
        url: String
    },
    aboutprincipal: {
        filename: String,
        url: String
    },
    eventName1: String,
    eventRole1: String,
    eventDate1: String,
    aboutEvent1: String,
    eventPhoto1: {
        filename: String,
        url: String
    },
    eventName2: String,
    eventRole2: String,
    eventDate2: String,
    aboutEvent2: String,
    eventPhoto2: {
        filename: String,
        url: String
    },
    eventName3: String,
    eventRole3: String,
    eventDate3: String,
    aboutEvent3: String,
    eventPhoto3: {
        filename: String,
        url: String
    },

    owner: {
         type: Schema.Types.ObjectId,
         ref : "User"
    }

})

const webPage =mongoose.model("webPage", webPageSchema);
module.exports = webPage;