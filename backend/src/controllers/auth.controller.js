// import User from "../models/User";
import User from "../models/User.js"; // Add .js extension
import bcrypt from "bcryptjs";

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
      generateToken(newUser._id, res);
      await newUser.save();
      
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
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
    
  } catch (error) {
    console.log("Error in signup controller", error);
    return res.status(500).json({ message: "Server error" });
  }
};