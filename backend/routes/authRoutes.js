import express from 'express';
import passport from 'passport';
import { googleCallback, googleAuth, completeGoogleSignup } from '../controllers/authController.js';

const router = express.Router();

// Google OAuth login
router.get('/google', googleAuth);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: true // Changed to true to maintain session
  }),
  googleCallback
);

// Complete Google signup with role
router.post('/complete-google-signup', completeGoogleSignup);

export default router;
