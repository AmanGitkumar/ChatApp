import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {

    try{

        const loggedInUserId = req.user._id;
        const filterUser = await User.find({ _id:{ $ne:loggedInUserId}}).select("-password");
        res.status(200).json(filterUser); 
    }catch(error){
        console.log("getting error in message sidebar",error.message);
        res.status(401).json({message:"server error for sidebar"});
    }
};

export const getMessages = async (req,res) => {

    try{

       const {id:userToChatId} = req.params;
       const myId = req.user._id;

       const messages = await Message.find({

        $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
        ]

       })

       res.status(200).json(messages)
    }catch(error){
        console.log("getting error to chats",error.message);
        res.status(401).json({message:"server error for chats"});
    }
};
export const sendMessage = async (req,res) => {

    try{

        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadRespond = await cloudinary.uploader.upload(image);
            imageUrl = uploadRespond.secure_url
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();

        // real time functionality goes here of socket.io;

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(200).json(newMessage);
    }catch(error){
        console.log("getting error to send message",error.message);
        res.status(401).json({message:"server error to send message"});
    }
};
