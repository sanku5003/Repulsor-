const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = require('../User');

const basicSchema = new Schema({
    logo :{
        filename : String,
        url : String
    } ,

    cover : {
        filename : String ,
        url : String
    } ,

    slogan : String ,
    num1 : String,
    text1 : String ,
    num2 : String,
    text2 : String,
    num3 : String,
    text3 : String,

    owner : {
         type: Schema.Types.ObjectId,
         ref : "User"
    }

})

module.exports = mongoose.model("Basic" , basicSchema);