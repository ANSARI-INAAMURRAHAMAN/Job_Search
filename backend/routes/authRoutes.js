import express from 'express';
import passport from 'passport';
import { User } from '../models/userSchema.js';

const router = express.Router();

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      const { user, isNewUser } = req.user;
      
      if (isNewUser || user.role === 'PENDING') {
        // New user or user without role - redirect to role selection
        const tempToken = user.getJWTToken();
        res.cookie('tempToken', tempToken, {
          expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        res.redirect(`${process.env.FRONTEND_URL}/select-role?new_user=true`);
      } else {
        // Existing user with role - normal login
        const token = user.getJWTToken();
        res.cookie('token', token, {
          expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Route to complete Google OAuth role selection
router.post('/complete-google-signup', async (req, res) => {
  try {
    const { role } = req.body;
    const tempToken = req.cookies.tempToken;
    
    if (!tempToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }
    
    // Verify temp token and get user
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(tempToken, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    // Clear temp token and set real token
    res.clearCookie('tempToken');
    const token = user.getJWTToken();
    res.cookie('token', token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ 
      success: true, 
      message: 'Registration completed successfully!',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete registration' 
    });
  }
});

export default router;
