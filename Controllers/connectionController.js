const connModel = require("../Models/connectionModel");
const userModel = require("../Models/userModel");

const jwt = require('jsonwebtoken');

exports.createConn = async(req,res)=>{
    try{
        const result = await connModel.findOne({$or :[{members: [req.body.memberone, req.body.membertwo]},{members: [req.body.membertwo, req.body.memberone]}]});
        if(result)
        {
            res.send({success:true, msg:"Connection Already Exists"})
        }
        else
        {
            const entry = new connModel({
                members: [req.body.memberone, req.body.membertwo]
            })

            const status = await entry.save();
            if(status)
            {
                res.send({success:true, msg:"New Connection Added"})
            }
            else
            {
                res.send({success:false, msg:"Couldnt Create Connection"})
            }
        }
    }
    catch(e)
    {
        console.log(e.message);
    }
}


exports.getConnections = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        const result = await connModel.find({members: decoded.id});
        
        const populatedRecievers = await Promise.all(
            result.map(async(connection)=>{
                const receiverID = connection.members.find((id)=> id != decoded.id);
                const receiver = await userModel.findById(receiverID).select("-password");
                return {
                    connectionId: connection._id,
                    receiver: receiver,
                }
            })
        )

        res.send({success:true, connections:populatedRecievers});
    }
    catch(e)
    {
        res.status(500)
        console.log(e.message);
    }
}