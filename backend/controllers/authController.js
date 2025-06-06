import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import passport from 'passport';

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

// Google OAuth initiation
export const googleAuth = (req, res, next) => {
  const { role } = req.query;
  
  if (!role || !['Employer', 'Job Seeker'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid role"
    });
  }

  // Store role in session for callback
  req.session.selectedRole = role;

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// Google OAuth callback
export const googleCallback = catchAsyncErrors(async (req, res, next) => {
  try {
    const userInfo = req.user;
    const selectedRole = req.session.selectedRole || 'Job Seeker';
    
    let user;
    
    if (userInfo.needsRole) {
      // Create new user with the selected role
      const { googleProfile } = userInfo;
      
      user = await User.create({
        name: googleProfile.displayName,
        email: googleProfile.emails[0].value,
        googleId: googleProfile.id,
        role: selectedRole,
        password: Math.random().toString(36).slice(-8) + '!A1', // Random secure password
        phone: 1234567890, // Default phone, user can update later
      });
    } else {
      // User already exists
      user = userInfo;
    }

    // Generate token
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

    // Set cookie and redirect
    res.cookie("token", token, options);
    
    // Clear role from session
    delete req.session.selectedRole;

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/?auth=success&role=${user.role}`);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});
