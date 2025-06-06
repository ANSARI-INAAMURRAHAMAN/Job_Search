import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    if (!decoded || !decoded.id) {
      return next(new ErrorHandler("Invalid token", 401));
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Authentication failed", 401));
  }
});
