const express = require('express');
const app = express();
const mongoose = require('mongoose')
require('dotenv').config(); 
const port = process.env.PORT || 9000;

const cookieParser = require('cookie-parser');

const cors = require('cors');

const io = require('socket.io')(8080, {
    cors:{
        origin: "http://localhost:3000",
        credentials:true
    }
})

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));

app.use(cookieParser());

mongoose.connect("mongodb+srv://msanyum:ARfdDsQRMwxhKsS3@cluster0.r6svpnh.mongodb.net/Privacy?retryWrites=true&w=majority&appName=Cluster0").then(()=>{
    console.log("Connected to Mongodb")
}).catch((e)=>{
    console.log("Error while connecting to db" + e.message);
})

app.use(express.json());

//Sockets
let users = [];
io.on('connection', socket=>{
    socket.on('addUser', userId=>{
        console.log("Add User Socket Function Running...")
        const isUserExist = users.find(user=> user.userId === userId);
        if(!isUserExist)
        {
            let user = {userId, socketId: socket.id};
            users.push(user);
        }  
        console.log("Sending Connected Users...")
        io.emit('getUsers', users);
    })

    socket.on('sendMessage', data=>{
        const receiver = users.find(user=>user.userId === data.receiverId);
        io.to(socket.id).emit('getMessage', {
            senderId: data.senderId,
            message:data.msg
        })
        if(receiver && receiver.socketId != socket.id)
        {
            console.log("Sending message forward...")
            io.to(receiver.socketId).emit('getMessage', {
                senderId: data.senderId,
                message:data.msg
            })
        }
        
    })
    
    socket.on('disconnect', ()=>{
        console.log("Removing Disconnected Users...")
        users = users.filter(user=>user.socketId !== socket.id);
        io.emit('getUsers', users);
    })

})


const userRoutes = require('./Routes/userRoutes');
const connectionRoutes = require('./Routes/connectionRoutes');
const msgRoutes = require('./Routes/msgRoutes');

app.use(userRoutes);
app.use(connectionRoutes);
app.use(msgRoutes);

app.listen(port, ()=>{
    console.log("Server running on Port " + port)
})


