import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { storage } from './storage';

export function setupGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials not found. Google login will be disabled.');
    return;
  }

  const callbackURL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
    : 'http://localhost:5000/api/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with Google ID
      let user = await storage.getUser(profile.id);
      
      if (!user) {
        // Check if user exists with same email
        const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (existingUser) {
          // Link Google account to existing user
          user = await storage.upsertUser({
            id: existingUser.id,
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
          });
        } else {
          // Create new user
          user = await storage.upsertUser({
            id: profile.id,
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
          });
        }
      } else {
        // Update existing user profile
        user = await storage.upsertUser({
          ...user,
          email: profile.emails?.[0]?.value || user.email,
          firstName: profile.name?.givenName || user.firstName,
          lastName: profile.name?.familyName || user.lastName,
          profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error, null);
    }
  }));
}

export interface GoogleUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}