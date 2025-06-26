import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next) => {

    try{

        const token = req.cookies.jwt;
        
        if(!token){
            return res.status(401).json({message: "Token not provided"});
        }
        const decode = jwt.verify(token,process.env.JWT_SECRET);

        if(!decode){
            return res.status(401).json({message: "Token is Invalid"});
        }

        const user = await User.findById(decode.userId).select("-password");

        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        req.user = user
        next();

    }catch(error){
        console.log("error in profile update route")
        return res.status(401).json({message: "internal error something"});
    }
}