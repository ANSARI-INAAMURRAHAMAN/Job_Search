import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userSchema.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Existing user - return with existing role
          return done(null, { user, isNewUser: false });
        } else {
          // New user - create with PENDING role
          const tempPassword =
            Math.random().toString(36).substring(2) +
            Math.random().toString(36).substring(2) +
            '!123';

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'PENDING', // Use PENDING for new Google users
            password: tempPassword,
            phone: '1234567890',
            googleId: profile.id,
          });

          return done(null, { user, isNewUser: true });
        }
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
