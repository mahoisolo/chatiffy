// import User from "../models/User";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import User from "../models/User.js"; // Add .js extension
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";

// Add this function or import it
const generateToken = (userId, res) => {
  // Your token generation logic here
  // Example with JWT:
  // const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
  // res.cookie('jwt', token, { ... });
};

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    } // Missing brace added here
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    
    // Fixed User.findOne usage
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      fullName: fullname,
      email: email,
      password: hashedPassword,
    });
    
    if (newUser) {
    //   generateToken(newUser._id, res);
    //   await newUser.save();
    const savedUser = await newUser.save();
    generateToken(savedUser._id, res);
      
      // Consistent response
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilepic: newUser.profilepic,
        }
      });
      try {
        await sendWelcomeEmail(savedUser.email,savedUser.fullName,ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error); 
      }
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
    
  } catch (error) {
    console.log("Error in signup controller", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const login=async(req,res)=>{
  const {email,password}=req.body;
  try {
    const user=await User.findOne({email});
    if(!user) return res.status(400).json({message:"invalid credentials"});
    const isPasswordCorrect=await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect)return res.status(400).json({message:"invalid credentials"});
    generateToken(user._id,res);
    res.status(200).json({
        message:"Login successful",
        user:{
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilepic:user.profilepic
        }
    });
  } catch (error) {
    console.error("Error in login controller",error);
    return res.status(500).json({message:"Server error"});
  }
}
export const logout=(_,res)=>{
  res.cookie('jwt','',{maxAge:0});
  res.status(200).json({message:"Logout successful"});

}
export const updateProfile=async(req,res)=>{
  try {
      const {profilePic}=req.body;
  if(!profilePic) return res.status(400).json({message:"Profile picture is required"});
  const userId=req.user._id;
  const updateResponse=await cloudinary.uploader.upload(profilePic)
  const updatedUser= await User.findByIdAndUpdate(userId,{profilePic:updateResponse.secure_url},{new:true});
  res.status(200).json(updatedUser) 
  } catch (error) {
    console.error("Error in updateProfile controller",error);
    return res.status(500).json({message:"Server error"});
  }

}