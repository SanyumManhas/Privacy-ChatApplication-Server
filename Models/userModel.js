const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        username:String,
        profilepic:String,
        password:String,
    },
    {versionKey: false}
)

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;