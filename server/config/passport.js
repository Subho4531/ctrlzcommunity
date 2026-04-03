const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const Member = require('../models/members');
const authService = require('../services/authService');

/**
 * Passport Configuration
 * Configures authentication strategies for local, Google OAuth, and GitHub OAuth
 */

// Serialize user for session storage
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Member.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Local Strategy (Email/Password)
 * Validates user credentials against database
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await Member.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if user registered with OAuth
        if (user.authProvider !== 'local') {
          return done(null, false, {
            message: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
          });
        }

        // Verify password
        const isPasswordValid = await authService.comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check approval status
        if (user.approvalStatus === 'rejected') {
          return done(null, false, { message: 'Your account has been rejected' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Google OAuth Strategy
 * Handles authentication via Google OAuth 2.0
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Handle OAuth user creation/update
          const user = await authService.handleOAuthUser(profile, 'google');
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials not configured. Google authentication will be unavailable.');
}

/**
 * GitHub OAuth Strategy
 * Handles authentication via GitHub OAuth
 */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Handle OAuth user creation/update
          const user = await authService.handleOAuthUser(profile, 'github');
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('GitHub OAuth credentials not configured. GitHub authentication will be unavailable.');
}

module.exports = passport;
