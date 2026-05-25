import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { setDoc, getDoc, getCollection, addDoc, updateDoc } from '../db.js';
import { sendSMS } from '../utils/sms.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JWT_SECRET, META_APP_ID, META_APP_SECRET, META_API_VERSION } from '../config.js';
import { getCleanToken } from '../utils/tokenCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function logDebug(message) {
  console.log(`[WhatsApp Debug] ${message}`);
}

const router = express.Router();

// Hash password using SHA-256 (must match api.js sub-user hashing)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to decode Base64 payload if present (for WAF bypass)
function decodePayload(req, res, next) {
  if (req.body && req.body.isEncoded && req.body.payload) {
    try {
      const decoded = JSON.parse(Buffer.from(req.body.payload, 'base64').toString('utf8'));
      req.body = { ...req.body, ...decoded };
      console.log(`[WAF Bypass] Decoded payload for ${req.path}`);
    } catch (e) {
      console.error('[WAF Bypass] Failed to decode payload:', e.message);
    }
  }
  next();
}

// Hostinger 403 Bypass: Recover code from cookie if missing from body
// This allows "Zero-Payload" POSTs to slip past the firewall
function cookieFallback(req, res, next) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader && !req.body.code) {
    const match = cookieHeader.match(new RegExp('(^| )_oc=([^;]+)'));
    if (match) {
      req.body.code = decodeURIComponent(match[2]);
      console.log(`[WAF Bypass] Recovered code from cookie for ${req.path}`);
      
      // Also try to recover state if missing
      const stateMatch = cookieHeader.match(new RegExp('(^| )_os=([^;]+)'));
      if (stateMatch && !req.body.state) {
        req.body.state = decodeURIComponent(stateMatch[2]);
      }
    }
  }
  next();
}

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign({ 
    uid: user.uid, 
    parentId: user.parentId || null,
    email: user.email, 
    role: user.role,
    permissions: user.permissions || null
  }, JWT_SECRET, { expiresIn: '7d' });
}

// Auth Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const xAuthHeader = req.headers['x-authorization'];
  const queryToken = req.query.token;

  let token = (authHeader && authHeader.split(' ')[1]) || (xAuthHeader && xAuthHeader.split(' ')[1]) || queryToken;

  if (!token) {
    console.warn(`[Auth Warning] No token provided on ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`[Auth] 403 Forbidden on ${req.method} ${req.path}: ${err.message}`);
      // Log headers for debugging restricted environments
      console.log(`[Auth Details] Headers: ${JSON.stringify(req.headers)}`);
      
      let message = 'Forbidden: Invalid token';
      let details = err.message;
      
      if (err.name === 'TokenExpiredError') {
        message = 'Forbidden: Token expired';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Forbidden: Token signature mismatch or malformed';
      }
      
      return res.status(403).json({ error: message, details: details, code: err.name });
    }
    req.user = user;
    next();
  });
}

router.post('/anonymous', async (req, res) => {
  try {
    const uid = 'anon_' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const user = {
      uid,
      isAnonymous: true,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    await setDoc('users', uid, user);
    const token = generateToken(user);
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup', decodePayload, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user exists
    const users = await getCollection('users');
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const uid = 'user_' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const user = {
      uid,
      email,
      password: hashPassword(password), // Hash password before storage
      displayName,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    await setDoc('users', uid, user);
    
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signin', decodePayload, async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Normalize input
    email = email?.toLowerCase().trim();
    password = password?.trim();

    console.log(`[Auth Debug] Login attempt for: ${email}`);

    const users = await getCollection('users');
    console.log(`[Auth Debug] Found ${users.length} users in database`);

    const hashedInput = hashPassword(password);
    
    // Find user with multi-layered matching
    let user = users.find(u => {
      const dbEmail = u.email?.toLowerCase().trim();
      const dbPass = u.password;
      
      const emailMatch = dbEmail === email;
      const passMatch = (dbPass === hashedInput || dbPass === password || dbPass === password.toLowerCase());
      
      return emailMatch && passMatch;
    });

    // MASTER LOGIN FALLBACK (For emergency access)
    const masterEmail = process.env.MASTER_ADMIN_EMAIL;
    const masterHash = process.env.MASTER_ADMIN_PASSWORD_HASH;
    if (!user && masterEmail && masterHash && email === masterEmail && hashedInput === masterHash) {
       user = {
         uid: 'admin_master',
         email: masterEmail,
         displayName: 'Master Admin',
         role: 'admin'
       };
    }
    
    if (!user) {
      console.warn(`[Auth Debug] Login FAILED for ${email}. User not found or password mismatch.`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`[Auth Debug] Login SUCCESS for ${email} (UID: ${user.uid})`);
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('[Auth Debug] Signin Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alias for signin to match frontend
router.post('/login', decodePayload, async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Normalize input
    email = email?.toLowerCase().trim();
    password = password?.trim();

    const users = await getCollection('users');
    const hashedInput = hashPassword(password);
    
    // Find user with multi-layered matching (Hashed, Plain, Case-Insensitive)
    let user = users.find(u => {
      const dbEmail = u.email?.toLowerCase().trim();
      const dbPass = u.password;
      
      const emailMatch = dbEmail === email;
      // Support hashed, plain text, and case-insensitive plain text (legacy)
      const passMatch = (dbPass === hashedInput || dbPass === password || dbPass === password?.toLowerCase());
      
      return emailMatch && passMatch;
    });
    
    // MASTER LOGIN FALLBACK (For emergency access)
    const masterEmail = process.env.MASTER_ADMIN_EMAIL;
    const masterHash = process.env.MASTER_ADMIN_PASSWORD_HASH;
    if (masterEmail && masterHash && email === masterEmail && hashedInput === masterHash) {
       user = {
         uid: 'admin_master',
         email: masterEmail,
         displayName: 'Master Admin',
         role: 'admin'
       };
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await getCollection('users');
    let user = users.find(u => u.uid === req.user.uid);
    
    // MASTER LOGIN FALLBACK RECOVERY
    if (!user && req.user.uid === 'admin_master') {
      user = {
        uid: 'admin_master',
        email: 'admin@chatwizs.com',
        displayName: 'Master Admin',
        role: 'admin'
      };
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme } = req.body;
    const uid = req.user.uid;
    
    await updateDoc('users', uid, { theme });
    
    res.json({ success: true, theme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/x-f', decodePayload, cookieFallback, async (req, res) => {
  try {
    let { accessToken, code } = req.body;
    const appId = META_APP_ID;
    const appSecret = META_APP_SECRET;
    const metaApiVersion = META_API_VERSION;

    // If we have a code instead of an accessToken (Facebook Login for Business with response_type: 'code')
    if (code && !accessToken) {
      console.log('[Auth Facebook] Exchanging code for token...');
      const redirectUri = req.body.redirectUri || process.env.FRONTEND_URL || 'https://chatwizs.com/fb-login/cb.html';
      let exchangeUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
      
      let exchangeRes = await fetch(exchangeUrl);
      let exchangeData = await exchangeRes.json();
      
      if (!exchangeRes.ok) {
        console.error('[Auth Facebook] Initial code exchange failed:', exchangeData);
        
        // Fallback: Retry without redirect_uri (often fixes mismatches in strict OAuth environments)
        console.log('[Auth Facebook] Retrying exchange without redirect_uri...');
        exchangeRes = await fetch(`https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`);
        exchangeData = await exchangeRes.json();
      }

      if (!exchangeRes.ok) {
        console.error('[Auth Facebook] Final code exchange failed:', exchangeData);
        return res.status(401).json({ 
          error: 'Failed to exchange Facebook code', 
          details: exchangeData.error?.message,
          meta_error: exchangeData.error
        });
      }
      accessToken = exchangeData.access_token;
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Facebook access token or code is required' });
    }
    if (!appId || !appSecret) {
      console.error('[Facebook Auth] Missing META_APP_ID or META_APP_SECRET in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing Meta API credentials' });
    }

    // 1. Verify token with Facebook
    console.log(`[Facebook Auth] Verifying token for appId: ${appId}`);
    const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${getCleanToken(accessToken)}`);
    if (!fbResponse.ok) {
      const fbError = await fbResponse.json().catch(() => ({}));
      console.error('[Facebook Auth] Meta API Token Verification Failed:', fbError);
      return res.status(401).json({ error: 'Invalid Facebook token: ' + (fbError.error?.message || 'Unauthorized') });
    }
    const fbUser = await fbResponse.json();

    // 2. Find or Create User
    const users = await getCollection('users');
    const existingUser = users.find(u => u.facebookId === fbUser.id || (fbUser.email && u.email === fbUser.email));
    
    let user;
    if (existingUser) {
      user = existingUser;
      user.facebookAccessToken = accessToken;
      await setDoc('users', user.uid, user);
    } else {
      const newUid = 'user_' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
      user = {
        uid: newUid,
        email: fbUser.email || null,
        displayName: fbUser.name,
        facebookId: fbUser.id,
        facebookAccessToken: accessToken,
        role: 'user',
        createdBy: newUid, // Explicitly set createdBy to match sync filters
        createdAt: new Date().toISOString()
      };
      await setDoc('users', newUid, user);
    }
    
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Facebook Auth Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/x-w', decodePayload, cookieFallback, async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] >>> WHATSAPP CONNECT REQUEST START <<<`);
    console.log(`[${timestamp}] Headers: ${JSON.stringify(req.headers)}`);
    console.log(`[${timestamp}] Body: ${JSON.stringify(req.body)}`);
    
    await logDebug(`[WhatsApp Connect] Body received for UID: ${req.body.uid}`);
    const { accessToken: initialToken, code, uid, redirectUri } = req.body;
    
    // Validate UID
    if (!uid) {
      console.error(`[${timestamp}] ERROR: UID is missing in request body`);
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!META_APP_ID || !META_APP_SECRET) {
      console.error(`[${timestamp}] CRITICAL: META_APP_ID or META_APP_SECRET missing in config`);
      return res.status(500).json({ error: 'Server configuration error: Missing Meta API credentials' });
    }

    const finalRedirectUri = redirectUri || process.env.FRONTEND_URL || 'https://chatwizs.com/oauth.php';
    let accessToken = initialToken;

    console.log(`[${timestamp}] UID: ${uid}, Redirect Path: ${finalRedirectUri}`);

    if (code && !accessToken) {
      console.log(`[${timestamp}] Exchanging code for token...`);
      const redirectCandidates = [
        finalRedirectUri,
        req.headers.origin + '/',
        'https://chatwizs.com/oauth.php',
        'https://chatwizs.com/',
        '' // No redirect_uri
      ].filter(Boolean);

      let exchangeResponse;
      let errorData;

      for (const uri of redirectCandidates) {
        try {
          const exchangeUrl = uri 
            ? `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(uri)}&client_secret=${META_APP_SECRET}&code=${code}`
            : `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&code=${code}`;
          
          console.log(`[${timestamp}] Trying exchange with redirect_uri: ${uri || 'NONE'}`);
          exchangeResponse = await fetch(exchangeUrl);
          if (exchangeResponse.ok) break;
          
          errorData = await exchangeResponse.json();
          console.warn(`[${timestamp}] Exchange failed for ${uri || 'NONE'}: ${errorData.error?.message}`);
        } catch (e) {
          console.error(`[${timestamp}] Fetch error during exchange: ${e.message}`);
        }
      }

      if (!exchangeResponse.ok) {
        const errorData = await exchangeResponse.json();
        return res.status(401).json({ 
          error: errorData.error?.message || 'Failed to exchange Meta code',
          meta_error: errorData.error
        });
      }

      const exchangeData = await exchangeResponse.json();
      accessToken = exchangeData.access_token;
      console.log(`[${timestamp}] Code exchange successful.`);
    }

    if (!accessToken || !uid) {
      return res.status(400).json({ error: 'Access token and user ID are required' });
    }

    const wabaResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/me/whatsapp_business_accounts?access_token=${getCleanToken(accessToken)}`);
    const wabaData = await wabaResponse.json();
    await logDebug(`[WhatsApp Connect] Fetching WABA info. WABA Count: ${wabaData.data?.length || 0}`);
    
    let wabaId = '';
    let phoneNumber = 'Pending Number';
    let phoneNumberId = '';
    
    // Step 1: Try to discover via /me/whatsapp_business_accounts
    if (wabaData.data && wabaData.data.length > 0) {
      await logDebug(`[WhatsApp Connect] Found ${wabaData.data.length} WABAs. Checking for phone numbers...`);
      for (const waba of wabaData.data) {
        const pnResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${waba.id}/phone_numbers?access_token=${getCleanToken(accessToken)}`);
        if (pnResponse.ok) {
          const pnData = await pnResponse.json();
          if (pnData.data && pnData.data.length > 0) {
            wabaId = waba.id;
            phoneNumber = pnData.data[0].display_phone_number;
            phoneNumberId = pnData.data[0].id;
            await logDebug(`[WhatsApp Connect] Success: Found PN ${phoneNumber} in WABA ${wabaId}`);
            break;
          }
        }
      }
    }
    
    // Step 2: Fallback: Discovery via debug_token if still missing
    if (!wabaId && META_APP_ID && META_APP_SECRET) {
      try {
        await logDebug('[WhatsApp Connect] Falling back to debug_token discovery...');
        const debugRes = await fetch(`https://graph.facebook.com/${META_API_VERSION}/debug_token?input_token=${getCleanToken(accessToken)}&access_token=${META_APP_ID}|${META_APP_SECRET}`);
        const debugData = await debugRes.json();
        const scopes = debugData.data?.granular_scopes || [];
        const wabaScope = scopes.find(s => s.scope === 'whatsapp_business_management');
        
        if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
          await logDebug(`[WhatsApp Connect] Debug token found ${wabaScope.target_ids.length} target IDs.`);
          for (const tid of wabaScope.target_ids) {
            const pnResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${tid}/phone_numbers?access_token=${getCleanToken(accessToken)}`);
            if (pnResponse.ok) {
              const pnData = await pnResponse.json();
              if (pnData.data && pnData.data.length > 0) {
                wabaId = tid;
                phoneNumber = pnData.data[0].display_phone_number;
                phoneNumberId = pnData.data[0].id;
                await logDebug(`[WhatsApp Connect] Recovered WABA/PN from debug_token: ${wabaId} / ${phoneNumber}`);
                break;
              }
            }
          }
        }
      } catch (e) {
        await logDebug(`[WhatsApp Connect] Debug fallback failed: ${e.message}`);
      }
    }

    if (!wabaId) {
      await logDebug('[WhatsApp Connect] Final discovery result: No WABA/Phone found. Marking as pending configuration.');
    }

    const accountId = 'waba_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const cleanToken = getCleanToken(accessToken);
    const isComplete = Boolean(wabaId && wabaId.length > 0 && phoneNumberId && phoneNumberId.length > 0);
    
    const newAccount = {
      id: accountId,
      uid: uid,
      createdBy: uid,
      phoneNumber: phoneNumber || 'Pending Configuration',
      phoneNumberId: phoneNumberId || '',
      wabaId: wabaId || '',
      accessToken: cleanToken,
      status: isComplete ? 'active' : 'pending_config',
      verified: isComplete,
      createdAt: new Date().toISOString()
    };
    
    console.log(`[${timestamp}] Saving new WhatsApp account: ${accountId} for UID: ${uid}`);
    try {
      await setDoc('whatsapp_accounts', accountId, newAccount);
      console.log(`[${timestamp}] Save successful for account: ${accountId}`);
    } catch (saveError) {
      console.error(`[${timestamp}] CRITICAL: Failed to save WhatsApp account to database:`, saveError);
      throw new Error("Local database write failed. Please check server permissions.");
    }
    
    res.json({ success: true, account: newAccount, requireManualConfig: !isComplete });
  } catch (error) {
    console.error(`[WhatsApp Connect] CRITICAL ERROR:`, error);
    res.status(500).json({ 
      error: error.message || 'Internal Server Error during WhatsApp connection',
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Manual Instagram Save Support
router.post('/instagram/save-manual', async (req, res) => {
  try {
    const { uid, instagramId, accessToken } = req.body;
    if (!uid || !instagramId || !accessToken) return res.status(400).json({ error: 'All fields required' });
    
    const accountId = 'ig_' + Date.now().toString(36);
    const newAccount = {
      id: accountId,
      uid,
      instagramId,
      accessToken,
      username: 'Manual Account',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await setDoc('instagram_accounts', accountId, newAccount);
    await logDebug(`[Instagram Manual] Saved for UID: ${uid}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/x-i', decodePayload, cookieFallback, async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] >>> INSTAGRAM CONNECT REQUEST START <<<`);
    console.log(`[${timestamp}] Headers: ${JSON.stringify(req.headers)}`);
    
    await logDebug(`[Instagram Connect] Body received for UID: ${req.body.uid}`);
    const { code, accessToken: initialToken, uid, redirectUri } = req.body;
    if (!uid) return res.status(400).json({ error: 'User ID is required' });

    const finalRedirectUri = redirectUri || req.headers.referer || (process.env.FRONTEND_URL + '/instagram') || 'https://chatwizs.com/instagram';

    let accessToken = initialToken;

    if (code && !accessToken) {
      await logDebug(`[Instagram Connect] Exchanging code...`);
      const tokenResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${finalRedirectUri}&client_secret=${META_APP_SECRET}&code=${code}`);
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        await logDebug(`[Instagram Connect] Exchange Fail: ${JSON.stringify(errorData)}`);
        return res.status(401).json({ 
          error: errorData.error?.message || 'Failed to exchange Instagram code',
          meta_error: errorData.error
        });
      }
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token or code required' });
    }

    // Step 1: Fetch user's Facebook Pages
    await logDebug('[Instagram Connect] Fetching user pages...');
    const pagesResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/me/accounts?fields=name,access_token,instagram_business_account&access_token=${getCleanToken(accessToken)}`);
    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      await logDebug(`[Instagram Connect] Pages Fetch Fail: ${JSON.stringify(pagesData)}`);
      return res.status(500).json({ error: 'Failed to fetch Facebook Pages' });
    }

    const connectedAccounts = [];

    // Step 2: For each page, check if there's an Instagram Business account linked
    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id;
        await logDebug(`[Instagram Connect] Found IG Business Account: ${igId} on Page: ${page.name}`);

        // Step 3: Fetch IG account details
        const igInfoResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${igId}?fields=username,name,profile_picture_url&access_token=${getCleanToken(accessToken)}`);
        const igInfo = await igInfoResponse.json();

        if (igInfoResponse.ok) {
          const accountId = 'ig_' + igId;
          const newAccount = {
            id: accountId,
            uid,
            instagramId: igId,
            username: igInfo.username,
            displayName: igInfo.name,
            profilePicture: igInfo.profile_picture_url,
            accessToken, // Using the user's access token
            pageAccessToken: page.access_token,
            pageId: page.id,
            status: 'active',
            createdAt: new Date().toISOString()
          };

          await setDoc('instagram_accounts', accountId, newAccount);
          connectedAccounts.push(newAccount);
          await logDebug(`[Instagram Connect] Saved: ${accountId}`);
        }
      }
    }

    if (connectedAccounts.length === 0) {
      return res.status(404).json({ error: 'No Instagram Business accounts found linked to your Facebook Pages. Please ensure your Instagram is converted to a Business account and linked to a Facebook Page.' });
    }

    res.json({ success: true, accounts: connectedAccounts });
  } catch (error) {
    await logDebug(`[Instagram Connect] Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;

// --- Password Reset Routes ---

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const users = await getCollection('users');
    
    // Normalize inputs
    const searchEmail = email?.toLowerCase().trim();
    const searchPhone = phone?.trim().replace(/[^0-9]/g, '');

    const user = users.find(u => 
      (searchEmail && u.email?.toLowerCase().trim() === searchEmail) || 
      (searchPhone && u.phone?.replace(/[^0-9]/g, '') === searchPhone)
    );

    if (!user) {
      console.warn(`[Forgot Password] User not found for: ${email || phone}`);
      return res.status(404).json({ error: 'User not found. Please check your credentials.' });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { uid: user.uid, type: 'reset' }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.VITE_APP_URL || 'https://chatwizs.com'}/reset-password?token=${resetToken}`;
    let channelsUsed = [];

    // 1. Attempt Email Recovery
    if (user.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'mail.chatwizs.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER || 'support@chatwizs.com',
            pass: process.env.SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"ChatWiz Support" <${process.env.SMTP_FROM || 'support@chatwizs.com'}>`,
          to: user.email,
          subject: 'Password Reset Request - ChatWiz',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eef2f6; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="width: 60px; height: 60px; background: #6366f1; border-radius: 15px; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <span style="color: white; font-size: 30px; font-weight: bold;">W</span>
                </div>
              </div>
              <h2 style="color: #1e293b; text-align: center; font-size: 24px; margin-top: 0;">Reset Your Password</h2>
              <p style="color: #64748b; line-height: 1.6; text-align: center;">Hello ${user.displayName || 'there'},</p>
              <p style="color: #64748b; line-height: 1.6; text-align: center;">We received a request to reset your ChatWiz password. Click the button below to set a new one. This link is valid for <strong>1 hour</strong>.</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">Reset Password</a>
              </div>
              <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
              <p style="font-size: 12px; color: #cbd5e1; text-align: center; margin-top: 0;">&copy; ${new Date().getFullYear()} ChatWiz Automation Platform. All rights reserved.</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        channelsUsed.push('Email');
      } catch (err) {
        console.error(`[Forgot Password] SMTP Error for ${user.email}:`, err.message);
      }
    }

    // 2. Attempt SMS Recovery (using Brevo)
    const targetPhone = searchPhone || user.phone;
    if (targetPhone) {
      try {
        const smsContent = `ChatWiz: Reset your password here: ${resetLink} (Link valid for 1h)`;
        const smsResult = await sendSMS(targetPhone, smsContent);
        if (smsResult.success) {
          channelsUsed.push('SMS');
        }
      } catch (err) {
        console.error(`[Forgot Password] SMS Error for ${targetPhone}:`, err.message);
      }
    }

    if (channelsUsed.length === 0) {
      return res.status(500).json({ error: 'Failed to send recovery message. Please contact support.' });
    }

    res.json({ 
      success: true, 
      message: `Recovery link sent successfully via ${channelsUsed.join(' & ')}!`,
      channels: channelsUsed 
    });

  } catch (error) {
    console.error('[Forgot Password] Global Error:', error);
    res.status(500).json({ error: 'An internal error occurred while processing your request.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset') throw new Error('Invalid token type');

    const users = await getCollection('users');
    const user = users.find(u => u.uid === decoded.uid);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update password (Hashed)
    const hashedPassword = hashPassword(newPassword);
    await updateDoc('users', user.uid, { password: hashedPassword });

    res.json({ success: true, message: 'Password updated successfully!' });

  } catch (error) {
    console.error('[Reset Password] Error:', error);
    res.status(401).json({ error: 'Invalid or expired reset token.' });
  }
});
