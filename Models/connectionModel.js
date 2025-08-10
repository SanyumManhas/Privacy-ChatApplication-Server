const mongoose = require("mongoose");

const connSchema = mongoose.Schema({
    members:[{type: mongoose.Types.ObjectId, ref: "user"}]
},{versionKey: false})

const connModel = mongoose.model("connection", connSchema);
module.exports = connModel;