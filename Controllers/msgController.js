const msgModel = require('../Models/msgModel');
const jwt = require('jsonwebtoken');

exports.sendMsg = async(req,res)=>{
    try {
        const token = req.cookies.token;

        const decoded = jwt.verify(token,process.env.SECRET_KEY);

        console.log(req.body.msg);
        
        //first check if exists, otherwise->
        const checkConnIdExists = await msgModel.findOneAndUpdate({connectionId: req.body.connectionId},
            {$push: {messages: {senderId: decoded.id,
            message:req.body.msg}}}
        );
        
        if(checkConnIdExists === null)
        {
            const newdoc = new msgModel({
                connectionId: req.body.connectionId,
                messages: [{senderId: decoded.id,
                message:req.body.msg}] 
            })
            const result = await newdoc.save();

            if(result)
            {
                res.send({success:true})
            }
            else
            {
                res.send({success:false})
            }
        }
        else
        {
            res.send({success:true})
        }

    } catch (e) {
        console.log(e.message)
        res.status(500).send("server Error")
    }
}

exports.getMsgs = async(req,res)=>{
    try {
        const connectionId = req.query.connid;
        console.log(connectionId)
        const msgs = await msgModel.findOne({connectionId: connectionId});
        console.log(msgs);
        if(msgs)
        {
            res.send({success:true, msgs: msgs.messages})
        }
        else
        {
            res.send({success:false})
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).send("Server Issue")
    }
}