const mongoose = require('mongoose');

const msgSchema = mongoose.Schema({
    connectionId: String,
    messages: [{senderId: {type: mongoose.Types.ObjectId, ref: "user"},
    message:String}]
},{versionKey: false})

const msgModel = mongoose.model("message",msgSchema);
module.exports = msgModel