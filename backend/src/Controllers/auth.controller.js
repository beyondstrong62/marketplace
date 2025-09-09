import mongoose from "mongoose";
import User from "../Models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, products } = req.body;

    // Check required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All required fields are mandatory" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    // Create and save user (password is hashed via pre-save hook)
    const user = new User({
      name,
      email,
      phone,
      password,
      role,       // Optional, defaults to 'customer' if not provided
      products    // Optional
    });

    await user.save();

    // Generate access token
    const token = user.generateAccessToken();

    // Send response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        products: user.products,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Check password
      const isMatch = await user.isPasswordCorrect(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Generate token
      const token = user.generateAccessToken();
      const loggedInUser = await User.findById(user._id).select("-password");

        //allows secure transfer of cookies, and only accessible by the server only
        const options = {
            httpOnly: true, 
            secure: true
        }

        // Send response
        return res.status(200)
        .cookie("token", token, options)
        .json({ message: "User Login successful", token, user: loggedInUser });
  
      
  
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const logoutUser = (req, res) => {
    try {
      // Clear the cookie by setting it with an expired date
      res.clearCookie("token", {
        httpOnly: true,
        secure: true, 
      });
  
      // Send response
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getUser=(req,res)=>{

    res.status(200).json({
      status: 200,
      user: req.user,
      message: "Current User Fetched Successfully"
  });

  }
  const addProductToUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId } = req.body;
      
      // Validate user ID and product ID
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid user ID or product ID' });
      }
      
      // Update user by pushing the product ID to products array
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { products: productId } },
        { new: true } // Return the updated document
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ 
        success: true,
        message: 'Product added to user successfully', 
        user: updatedUser 
      });
    } catch (error) {
      console.error('Error adding product to user:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to add product to user'
      });
    }
  };

// Get user by ID - for product details
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate the user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    // Find the user and exclude sensitive fields
    const user = await User.findById(userId).select('-password');

    // If no user found
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return user details
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user details',
      error: error.message 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // This comes from your authentication middleware
    
    // Validate request data
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the new password
    
    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Password reset failed due to server error"
    });
  }
};


export {registerUser,loginUser,logoutUser,getUser,addProductToUser,getUserById,resetPassword};
