import express from 'express';
import passport from 'passport';
import { googleCallback, googleAuth } from '../controllers/authController.js';

const router = express.Router();

// Google OAuth login
router.get('/google', googleAuth);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  }),
  googleCallback
);

// Test route to check OAuth status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    session: req.session ? 'active' : 'inactive'
  });
});

// Test route to check cookies
router.get('/test-cookie', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: req.headers.cookie,
    message: 'Cookie test endpoint'
  });
});

export default router;
