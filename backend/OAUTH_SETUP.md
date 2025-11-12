# OAuth Setup Guide

This guide explains how to set up Google and GitHub OAuth authentication for the application.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Backend URL (for constructing callback URLs)
BACKEND_URL=http://localhost:3000

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Session Secret (for express-session)
SESSION_SECRET=your-random-session-secret-key
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: 
     - Development: `http://localhost:3000/auth/github/callback`
     - Production: `https://yourdomain.com/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add both to your `.env` file

## Production Setup

For production, update the callback URLs in:
1. Google Cloud Console
2. GitHub OAuth App settings
3. Your `.env` file

Make sure to:
- Use HTTPS URLs in production
- Set `NODE_ENV=production` in your environment
- Use a strong `SESSION_SECRET`
- Update `FRONTEND_URL` and `BACKEND_URL` to your production domains

## Testing

1. Start your backend server
2. Navigate to the login page
3. Click "Continue with Google" or "Continue with GitHub"
4. Complete the OAuth flow
5. You should be redirected back and logged in


