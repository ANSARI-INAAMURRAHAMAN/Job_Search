import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userSchema.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/api/v1/auth/google/callback`
          : 'http://localhost:8000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if user exists with this email
        existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user data object for role selection
        const newUserData = {
          googleProfile: profile,
          needsRole: true,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          googleId: profile.id,
        };

        return done(null, newUserData);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  // Handle both existing users and new user data
  if (user._id) {
    done(null, { id: user._id, type: 'existing' });
  } else if (user.needsRole) {
    done(null, { userData: user, type: 'newUser' });
  } else {
    done(null, user);
  }
});

passport.deserializeUser(async (serializedUser, done) => {
  try {
    if (serializedUser.type === 'existing') {
      const user = await User.findById(serializedUser.id);
      done(null, user);
    } else if (serializedUser.type === 'newUser') {
      done(null, serializedUser.userData);
    } else {
      done(null, serializedUser);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
