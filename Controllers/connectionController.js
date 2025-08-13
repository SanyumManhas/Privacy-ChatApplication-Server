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
        const token = req.cookies?.token; 
        if(!token)
        {
            const authHeader = req.headers.authorization;
            if(authHeader && authHeader.startsWith("Bearer ")
               {
                    const token = authHeader.split(" ")[1];
               }
        }
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        
        console.log("Fetching Connections....")
        const connections = await connModel.find({members: decoded.id}).populate({
            path: 'members',
            select: '-password',
            match: {_id: {$ne: decoded.id}}
        })

        console.log("Populating Receivers...")
        const populatedReceivers = connections.map(conn=>({
            connectionId: conn._id,
            receiver: conn.members[0]
        }))

        console.log("Sending Data...")
        res.send({success:true, connections: populatedReceivers});
    }
    catch(e)
    {
        res.status(500)
        console.log(e.message);
    }
}
