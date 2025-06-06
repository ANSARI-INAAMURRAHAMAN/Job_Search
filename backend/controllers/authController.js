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
  
  if (role && ['Employer', 'Job Seeker'].includes(role)) {
    // Store role in session for direct callback
    req.session.selectedRole = role;
  }

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// Google OAuth callback
export const googleCallback = catchAsyncErrors(async (req, res, next) => {
  try {
    const userInfo = req.user;
    const selectedRole = req.session.selectedRole;
    
    console.log('Google OAuth callback - userInfo:', userInfo);
    console.log('Selected role from session:', selectedRole);
    
    if (userInfo.needsRole) {
      // New user - store Google profile and redirect to role selection
      req.session.googleProfile = userInfo.googleProfile;
      
      if (selectedRole) {
        // Role was pre-selected, create user directly
        const { googleProfile } = userInfo;
        
        const user = await User.create({
          name: googleProfile.displayName,
          email: googleProfile.emails[0].value,
          googleId: googleProfile.id,
          role: selectedRole,
          password: Math.random().toString(36).slice(-8) + '!A1',
          phone: 1234567890,
        });
        
        console.log('New user created with pre-selected role:', user._id);
        
        // Generate token and set cookie with improved settings for cross-origin
        const token = user.getJWTToken();
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          secure: true, // Always secure in production
          sameSite: "none", // Required for cross-origin
          path: "/",
          domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
        };

        console.log('Setting cookie with options:', cookieOptions);
        res.cookie("token", token, cookieOptions);
        
        // Clear session data
        delete req.session.selectedRole;
        delete req.session.googleProfile;
        
        // Redirect to home page
        const redirectUrl = `${process.env.FRONTEND_URL}/?auth=success&role=${encodeURIComponent(user.role)}&name=${encodeURIComponent(user.name)}&token=${encodeURIComponent(token)}`;
        console.log('Redirecting to:', redirectUrl);
        return res.redirect(redirectUrl);
      } else {
        // No role selected, redirect to role selection page
        console.log('Redirecting to role selection');
        const redirectUrl = `${process.env.FRONTEND_URL}/role-selection?new_user=true&google_auth=true`;
        console.log('Role selection redirect URL:', redirectUrl);
        return res.redirect(redirectUrl);
      }
    }

    // Existing user - generate token and redirect
    console.log('Processing existing user:', userInfo._id, userInfo.role);
    
    const token = userInfo.getJWTToken();
    
    // Try multiple cookie configurations for better compatibility
    const cookieOptions = [
      {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        domain: ".onrender.com"
      },
      {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
      },
      {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
      }
    ];

    // Set multiple cookies for better compatibility
    cookieOptions.forEach((options, index) => {
      const cookieName = index === 0 ? 'token' : `token${index}`;
      res.cookie(cookieName, token, options);
      console.log(`Setting cookie ${cookieName} with options:`, options);
    });
    
    // Clear session data
    delete req.session.selectedRole;
    
    // Always include token in URL as fallback
    const redirectUrl = `${process.env.FRONTEND_URL}/?auth=success&role=${encodeURIComponent(userInfo.role)}&name=${encodeURIComponent(userInfo.name)}&token=${encodeURIComponent(token)}`;
    console.log('Existing user redirect URL:', redirectUrl);
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// Complete Google signup with role selection
export const completeGoogleSignup = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.body;
  const googleProfile = req.session.googleProfile;

  console.log('Complete Google signup - role:', role);
  console.log('Google profile in session:', !!googleProfile);

  if (!googleProfile) {
    return next(new ErrorHandler("Google profile not found in session. Please try again.", 400));
  }

  if (!role || !['Employer', 'Job Seeker'].includes(role)) {
    return next(new ErrorHandler("Please select a valid role", 400));
  }

  try {
    // Create new user with selected role
    const user = await User.create({
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      googleId: googleProfile.id,
      role: role,
      password: Math.random().toString(36).slice(-8) + '!A1',
      phone: 1234567890,
    });

    console.log('User created successfully:', user._id);

    // Clear session
    delete req.session.googleProfile;

    // Generate token and set cookie with improved settings
    const token = user.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true, // Always secure in production
      sameSite: "none", // Required for cross-origin
      path: "/",
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    };

    res.cookie("token", token, options).json({
      success: true,
      message: "Registration completed successfully!",
      user,
    });

  } catch (error) {
    console.error('Complete Google signup error:', error);
    return next(new ErrorHandler("Failed to complete registration", 500));
  }
});
