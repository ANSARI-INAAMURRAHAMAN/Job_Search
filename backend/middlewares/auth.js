import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  
  console.log('Auth middleware - Cookies received:', Object.keys(req.cookies));
  console.log('Auth middleware - Token present:', !!token);
  
  if (!token) {
    console.log('Auth middleware - No token found in cookies');
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    console.log('Auth middleware - Token decoded successfully, user ID:', decoded.id);
    
    if (!decoded || !decoded.id) {
      console.log('Auth middleware - Invalid token structure');
      return next(new ErrorHandler("Invalid token", 401));
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('Auth middleware - User not found in database');
      return next(new ErrorHandler("User not found", 401));
    }
    
    console.log('Auth middleware - Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth middleware - JWT verification failed:', error.message);
    return next(new ErrorHandler("Authentication failed", 401));
  }
});
