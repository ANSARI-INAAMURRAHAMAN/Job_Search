import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userSchema.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Strategy - Profile received:', profile.id, profile.emails[0].value);
        
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          console.log('Existing user found by Google ID:', existingUser._id);
          return done(null, existingUser);
        }

        // Check if user exists with this email
        existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          console.log('Existing user found by email, linking Google ID:', existingUser._id);
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        // New user - needs role selection
        console.log('New user detected, needs role selection');
        return done(null, {
          googleProfile: profile,
          needsRole: true,
        });
      } catch (error) {
        console.error('Google Strategy error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;