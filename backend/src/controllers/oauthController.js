import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';

dotenv.config();

// Helper function to get callback URL
const getCallbackURL = (provider) => {
    const baseURL = process.env.BACKEND_URL || 'http://localhost:3000';
    return process.env[`${provider}_CALLBACK_URL`] || `${baseURL}/auth/${provider.toLowerCase()}/callback`;
};

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL('GOOGLE')
    }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Check if user exists with this email
        user = await User.findOne({ emailId: profile.emails[0].value.toLowerCase() });
        
        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }
        
        // Create new user
        const nameParts = profile.displayName.split(' ');
        const firstName = nameParts[0] || profile.name?.givenName || 'User';
        const lastName = nameParts.slice(1).join(' ') || profile.name?.familyName || '';
        
        user = await User.create({
            firstName,
            lastName,
            emailId: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            password: '', // OAuth users don't need password
            role: 'user'
        });
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
    }));
    console.log('Google OAuth strategy configured');
} else {
    console.warn('Google OAuth not configured: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
}

// Configure GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: getCallbackURL('GITHUB')
    }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists with this GitHub ID
        let user = await User.findOne({ githubId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Check if user exists with this email
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        user = await User.findOne({ emailId: email.toLowerCase() });
        
        if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            await user.save();
            return done(null, user);
        }
        
        // Create new user
        const nameParts = (profile.displayName || profile.username).split(' ');
        const firstName = nameParts[0] || profile.username || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        user = await User.create({
            firstName,
            lastName,
            emailId: email.toLowerCase(),
            githubId: profile.id,
            password: '', // OAuth users don't need password
            role: 'user'
        });
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
    }));
    console.log('GitHub OAuth strategy configured');
} else {
    console.warn('GitHub OAuth not configured: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
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

// Google OAuth initiation
export const googleAuth = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured&provider=google`);
    }
    return passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
};

// Google OAuth callback
export const googleCallback = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
        
        // Generate JWT token
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
        
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        
        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&success=true`);
    })(req, res, next);
};

// GitHub OAuth initiation
export const githubAuth = (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured&provider=github`);
    }
    return passport.authenticate('github', {
        scope: ['user:email']
    })(req, res, next);
};

// GitHub OAuth callback
export const githubCallback = (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    passport.authenticate('github', { session: false }, (err, user, info) => {
        if (err) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
        
        // Generate JWT token
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
        
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        
        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&success=true`);
    })(req, res, next);
};

