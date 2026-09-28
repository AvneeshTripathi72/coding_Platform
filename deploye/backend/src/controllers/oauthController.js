import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  path: '/',
});

// Helper function to get callback URL
const getCallbackURL = (provider) => {
  const baseURL = process.env.BACKEND_URL || (isProduction ? 'https://code-verse-api.vercel.app' : 'http://localhost:3000');
  return process.env[`${provider}_CALLBACK_URL`] || `${baseURL}/auth/${provider.toLowerCase()}/callback`;
};

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL('GOOGLE')
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (email) {
        user = await User.findOne({ emailId: email });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      const nameParts = (profile.displayName || '').split(' ');
      const firstName = nameParts[0] || profile.name?.givenName || 'User';
      const lastName = nameParts.slice(1).join(' ') || profile.name?.familyName || '';
      
      user = await User.create({
        firstName,
        lastName,
        emailId: email || `${profile.id}@google.oauth`,
        googleId: profile.id,
        password: '',
        role: 'user'
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('Google OAuth strategy configured');
} else {
  console.log('Google OAuth not configured (skipped)');
}

// Configure GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: getCallbackURL('GITHUB')
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      const email = (profile.emails?.[0]?.value || `${profile.username}@github.local`).toLowerCase();
      user = await User.findOne({ emailId: email });
      
      if (user) {
        user.githubId = profile.id;
        await user.save();
        return done(null, user);
      }
      
      const nameParts = (profile.displayName || profile.username || 'User').split(' ');
      const firstName = nameParts[0] || profile.username || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      user = await User.create({
        firstName,
        lastName,
        emailId: email,
        githubId: profile.id,
        password: '',
        role: 'user'
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('GitHub OAuth strategy configured');
} else {
  console.log('GitHub OAuth not configured (skipped)');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const getFrontendUrl = () => process.env.FRONTEND_URL || (isProduction ? 'https://code-verse.vercel.app' : 'http://localhost:5173');

// Google OAuth initiation
export const googleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${getFrontendUrl()}/login?error=oauth_not_configured&provider=google`);
  }
  return passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// Google OAuth callback
export const googleCallback = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${getFrontendUrl()}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${getFrontendUrl()}/login?error=oauth_failed`);
    }
    
    const token = jwt.sign(
      {
        _id: user._id,
        userId: user._id,
        emailId: user.emailId,
        name: user.firstName,
        role: user.role
      },
      process.env.JWT_SECRET || 'Avanish',
      { expiresIn: '7d' }
    );
    
    res.cookie('token', token, getCookieOptions());
    res.redirect(`${getFrontendUrl()}/login?token=${token}&success=true`);
  })(req, res, next);
};

// GitHub OAuth initiation
export const githubAuth = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${getFrontendUrl()}/login?error=oauth_not_configured&provider=github`);
  }
  return passport.authenticate('github', {
    scope: ['user:email']
  })(req, res, next);
};

// GitHub OAuth callback
export const githubCallback = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${getFrontendUrl()}/login?error=oauth_not_configured`);
  }
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${getFrontendUrl()}/login?error=oauth_failed`);
    }
    
    const token = jwt.sign(
      {
        _id: user._id,
        userId: user._id,
        emailId: user.emailId,
        name: user.firstName,
        role: user.role
      },
      process.env.JWT_SECRET || 'Avanish',
      { expiresIn: '7d' }
    );
    
    res.cookie('token', token, getCookieOptions());
    res.redirect(`${getFrontendUrl()}/login?token=${token}&success=true`);
  })(req, res, next);
};
