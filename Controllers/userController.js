const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require("../Routes/cloudinary");

require('dotenv').config();

const saltRounds = 10;

//Secret Key for encryption
const SECRET_KEY = process.env.SECRET_KEY;

//Buffer for hex
const hexToBuffer = (hex) => Buffer.from(hex, 'hex');

//Decryption Function
const decryptPassword = (encryptedHex, ivHex) => {
    const key = Buffer.from(SECRET_KEY, 'utf8');
    const iv = hexToBuffer(ivHex);
    const encryptedData = hexToBuffer(encryptedHex);
  
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
};

const jwt = require('jsonwebtoken');

//Upload Config for Photos
const uploadToCloudinary = async (fileBuffer, filename) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                { resource_type: "image", folder: "Privacy-userpics", public_id: filename },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
                );
                stream.end(fileBuffer);
        });
};

exports.createUser = async(req,res)=>{
    try{   
    
    let picname = '';
    
    if(req.file)
    {
        picname = await uploadToCloudinary(req.file.buffer, `userpic_${req.body.username}`);
        console.log(picname);
    }
    else
    {
        picname = "nopic.jpg";
    }


    const decryptpass = decryptPassword(req.body.encryptedData,req.body.iv);
    const hash = bcrypt.hashSync(decryptpass, saltRounds);
    console.log("hash", hash);

    const result = new userModel({
        username:req.body.username,
        profilepic:picname,
        password:hash,
    })

    const added = result.save();

    if(added)
    {
        res.send({success:true});
    }
    else
    {
        res.send({success:false});
    }
    }
    catch(e)
    {
        res.status(500).send("Server Side Error- Couldnt Create User")
    }
}

exports.loginUser = async(req,res)=>{
    try{
        const user = await userModel.findOne({username:req.body.username});
        const isMatch = bcrypt.compareSync(req.body.password,user.password);

        if(isMatch)
        {
            const token = jwt.sign({ id:user._id }, SECRET_KEY, {
                expiresIn:"7d"
            });

           res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // only HTTPS in prod
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
            });

            const userObj = user.toObject();
            delete userObj.password;
            
            res.send({ success: true, userdetails:userObj, token});
        }
        else
        {
            res.send({success:false});
        }
    }
    catch(e)
    {
        res.status(500).send("Server Side issue while Logging in");
    }
}

exports.logoutUser = async(req,res)=>{
    try{
        res.clearCookie("token", {
            httpOnly: true,
            // secure: true,
            sameSite: "lax",
            path: "/" 
        });
        res.send({ success: true});
    }
    catch(e)
    {
        res.status(500).send({success:false})
    }
}

exports.findUsers = async(req,res)=>{
    try{
        const {query} = req.body;

        const result = await userModel.find({username: {$regex:query, $options:'i'}});
        if(result.length>0)
        {
            res.status(200).send({users:result});
        }
        else
        {
            res.status(400)
        }
    }
    catch(e)
    {
        console.log(e.message);
        res.status(500).send("Server Side Error while finding Users", e.message);
    }
}

exports.getUser = async(req,res)=>{
    let token = req.cookies?.token; // assuming you set cookie name as 'token'
    if(!token)
    {
        const authHeader = req.headers.authorization;
        if(authHeader && authHeader.startsWith("Bearer "))
           {
                token = authHeader.split(" ")[1];
           }
    }
    if (!token) return res.status(401).send("Unauthorized");

    try{
        const decoded = jwt.verify(token, SECRET_KEY);
        const userdata = await userModel.findOne({_id: decoded.id});
        res.status(200).send({ success: true, user: userdata});
    }
    catch(e)
    {
        console.log(e.message);
    }
}
