import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";

// Function to generate token and set cookie
const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,
  });
};

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role.", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  console.log('Logout request received');
  
  // Clear all possible cookie variations
  const cookieOptions = [
    {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
      path: "/",
      domain: ".onrender.com"
    },
    {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
      path: "/"
    },
    {
      httpOnly: true,
      expires: new Date(0),
      secure: false,
      sameSite: "lax",
      path: "/"
    }
  ];

  // Clear multiple cookie variations
  cookieOptions.forEach((options, index) => {
    const cookieName = index === 0 ? 'token' : `token${index}`;
    res.cookie(cookieName, "", options);
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully.",
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  // Get complete user data including all profile fields
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  res.status(200).json({
    success: true,
    user,
  });
});

// Update user profile with extended information (bulk update)
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  console.log("Update Profile Request Body:", req.body);
  
  const updateData = { ...req.body };
  
  // Remove any undefined or null values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === null) {
      delete updateData[key];
    }
  });
  
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: false, // Disable validation for bulk update
    }
  ).select('-password');
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  console.log("Updated User:", user);
  
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// Get user profile by ID (for recruiters to view applicant profiles)
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  res.status(200).json({
    success: true,
    user,
  });
});