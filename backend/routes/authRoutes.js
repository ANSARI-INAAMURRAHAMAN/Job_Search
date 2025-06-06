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

export default router;
