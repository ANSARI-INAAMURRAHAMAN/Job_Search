import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token = req.cookies.token;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
    console.log('Auth middleware - Using token from Authorization header');
  }
  
  console.log('Auth middleware - Request path:', req.path);
  console.log('Auth middleware - All cookies:', Object.keys(req.cookies));
  console.log('Auth middleware - Has Authorization header:', !!req.headers.authorization);
  console.log('Auth middleware - Token present:', !!token);
  console.log('Auth middleware - Token source:', req.cookies.token ? 'cookie' : req.headers.authorization ? 'header' : 'none');
  
  if (!token) {
    console.log('No token found in cookies or Authorization header');
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Token decoded successfully for user ID:', decoded.id);
    
    if (!decoded || !decoded.id) {
      console.log('Invalid token structure');
      return next(new ErrorHandler("Invalid token", 401));
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return next(new ErrorHandler("User not found", 401));
    }
    
    console.log('User authenticated successfully:', user.name, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return next(new ErrorHandler("Authentication failed", 401));
  }
});
