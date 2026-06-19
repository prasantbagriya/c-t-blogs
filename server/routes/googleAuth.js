import express from 'express';
import { google } from 'googleapis';
import { getCollection, setDoc, getDoc } from '../db.js';

const router = express.Router();

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

function getOAuth2Client(redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('[Google Auth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables.');
  }

  // Use the provided redirectUri, fallback to a default if absolutely necessary (though it should always be provided)
  const finalRedirectUri = redirectUri || (process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/api/google/callback` : 'http://localhost:5173/api/google/callback');

  return new google.auth.OAuth2(clientId, clientSecret, finalRedirectUri);
}

// 1. Generate Auth URL
router.get('/auth', (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'UID is required' });

    // Dynamically build the redirect URI
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const dynamicRedirectUri = `${protocol}://${host}/api/google/callback`;

    const oauth2Client = getOAuth2Client(dynamicRedirectUri);
    
    // Pass uid in state so we can recover it in the callback
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request a refresh token
      prompt: 'consent', // Force consent prompt to guarantee refresh_token
      scope: SCOPES,
      state: encodeURIComponent(JSON.stringify({ uid })),
      redirect_uri: dynamicRedirectUri // Pass explicitly to prevent 'Missing required parameter'
    });

    res.redirect(url);
  } catch (error) {
    console.error('[Google Auth] Error generating URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. OAuth Callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('[Google Auth] OAuth Error:', error);
      return res.redirect(`${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard?tab=integrations&google_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }

    let parsedState;
    try {
      parsedState = JSON.parse(decodeURIComponent(state));
    } catch (e) {
      return res.status(400).send('Invalid state parameter');
    }

    const { uid } = parsedState;

    // Dynamically build the redirect URI to match the one used during /auth
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const dynamicRedirectUri = `${protocol}://${host}/api/google/callback`;

    const oauth2Client = getOAuth2Client(dynamicRedirectUri);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info to store their email/name
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Save tokens in database
    const accountId = `google_${uid}_${Date.now()}`;
    const accountData = {
      id: accountId,
      uid,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scopes: tokens.scope,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in a centralized workspace accounts collection
    await setDoc('google_workspace_accounts', accountId, accountData);

    // Redirect back to frontend
    res.redirect(`${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard?tab=integrations&google_success=true`);
  } catch (error) {
    console.error('[Google Auth Callback] Error:', error);
    res.redirect(`${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard?tab=integrations&google_error=${encodeURIComponent(error.message || 'unknown_error')}`);
  }
});

export default router;
