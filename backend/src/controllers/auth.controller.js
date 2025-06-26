import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"; 
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res) =>{
    
    const {fullName,email,password} = req.body;
    try{
        if(!fullName || !email || ! password){
        return res.status(400).json({message: "All fields are require"});

        }
        if(password.length < 5){
            return res.status(400).json({message: "Password must be at least 5 characters"});
        }
        const user = await User.findOne({email})
        if(user) return res.status(400).json({message: "Email is already exist"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })
        if(newUser){
            // generate jwt token
            generateToken(newUser._id,res)
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });
        }
        else{
            res.status(400).json({message: "Invalid User data"});
        }
    } catch(error){
        console.log("Error in signup controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const login = async (req,res) =>{
    
    const {email,password} =  req.body;
    try{

        if(!email || !password){
            return res.status(400).json({message: "All fields are require"});
        }
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"This email does not exist please signup"});
        const isPassword = await bcrypt.compare(password,user.password)
        if(!isPassword){
             res.status(400).json({message:"password does't match"})
        }
       
        generateToken(user._id,res);
        res.status(200).json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    }catch(error){
        console.log("Error in login controller:",error.message);
        res.status(500).json({message: "server error"});
    }
};

export const logout = (req,res) =>{
    
    try{

        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logout successfully"})

    } catch(error){
        console.log("Error in logout controller",error.message);
        res.status(400).json({message:"internal server error"});
    }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!profilePic) {
      return res.status(400).json({ message: "Please upload a profile pic" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile-pics",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password"); // Optional: exclude password from response

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};



export const checkAuth = (req,res) => {

    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("error to check authentication",error.message);
        res.status(401).json({message:"auth error"})
    }
};