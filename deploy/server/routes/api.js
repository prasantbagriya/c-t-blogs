import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getCollection, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from '../db.js';
import { suggestReply, detectOptOut } from '../ai.js';
import { processWidgetMessage, processFlowMessage } from '../flowEngine.js';
import { syncAgentKnowledge } from '../utils/syncEngine.js';
import { syncShopifyProducts, syncShopifyOrders } from '../utils/shopify.js';
import { JWT_SECRET, UPLOAD_DIR as CONFIG_UPLOAD_DIR } from '../config.js';
import * as threadsController from '../threads/controller.js';
import * as facebookController from '../facebook/controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const META_APP_ID = process.env.META_APP_ID;


const router = express.Router();

const collectionMap = {
  'wa-c': 'whatsapp_accounts',
  'ig-c': 'instagram_accounts',
  'ms-c': 'messages',
  'cp-c': 'campaigns',
  'tp-c': 'templates',
  'bl-c': 'blacklist',
  'fw-c': 'chat_flows_whatsapp',
  'fi-c': 'chat_flows_instagram',
  'aa-c': 'ai_agents',
  'pd-c': 'products',
  'tk-c': 'tickets',
  'cm-c': 'customer_profiles',
  'us-c': 'users',
  'th-c': 'threads_accounts',
  'ft-c': 'chat_flows_threads',
  'fwd-c': 'chat_flows_widget',
  'chat_flows_widget': 'chat_flows_widget',
  'ws-c': 'widget_settings',
  'widget_settings': 'widget_settings',
  'widgets': 'widget_settings'
};

function resolveCollection(name) {
  return collectionMap[name] || name;
}

/**
 * RENAMED from handleFirestoreError for clarity (not using Firestore)
 */
export function handleDatabaseError(error, operationType, path) {
  console.error("Database API Error:", operationType, path, error);
}

// Auth Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const xAuthHeader = req.headers['x-authorization'];
  const queryToken = req.query.token;

  let token = (authHeader && authHeader.split(' ')[1]) || (xAuthHeader && xAuthHeader.split(' ')[1]) || queryToken;

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
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

const getEffectiveUid = (req) => {
  // Master Admin can see everything, map it to the primary user who owns the data
  if (req.user.uid === 'admin_master') {
    return 'user_1774694137625kfo9yph'; 
  }
  return req.user.parentId || req.user.uid;
};

// --- File Upload Configuration ---
let uploadDir = CONFIG_UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    // Fallback to dist/uploads if public/uploads is restricted
    uploadDir = path.join(__dirname, '../../dist/uploads');
    if (!fs.existsSync(uploadDir)) {
      try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
    }
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload route (placed before auto-auth if we want public uploads, or after if restricted)
// Let's place it AFTER authenticateToken to keep it secure

// --- Endpoints ---

// --- PUBLIC WIDGET ENDPOINTS (No Auth Required) ---
router.get('/public/widget/settings/:widgetId', async (req, res) => {
  try {
    const { widgetId } = req.params;
    console.log(`[WidgetAPI] Fetching settings for widget: ${widgetId}`);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    const settings = await getDoc('widget_settings', widgetId);
    if (!settings) return res.status(404).json({ error: 'Widget not found' });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/public/widget/messages/read', async (req, res) => {
  try {
    const { messageIds } = req.body;
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'messageIds array is required' });
    }
    
    for (const id of messageIds) {
      await updateDoc('messages', id, { unread: false });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/public/widget/message', async (req, res) => {
  try {
    const { widgetId, visitorId, text, metadata, interactiveId, submissionData } = req.body;
    console.log(`[WidgetAPI] Incoming message from ${visitorId} for widget ${widgetId}: ${text}`);
    if (!widgetId || !visitorId) {
      return res.status(400).json({ error: 'widgetId and visitorId are required' });
    }

    const settings = await getDoc('widget_settings', widgetId);
    if (!settings) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Save message to DB
    await addDoc('messages', {
      uid: settings.uid,
      widgetId,
      visitorId,
      text,
      sender: 'visitor',
      senderName: metadata?.name || 'Visitor',
      source: 'widget',
      timestamp: new Date().toISOString(),
      unread: true,
      interactiveId,
      submissionData
    });

    // Process via Flow Engine
    const response = await processWidgetMessage({
      widgetId,
      uid: settings.uid,
      visitorId,
      text,
      metadata,
      interactiveId,
      submissionData
    });

    res.json(response);
  } catch (error) {
    console.error('[WidgetAPI] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/public/widget/messages/:widgetId/:visitorId', async (req, res) => {
  try {
    const { widgetId, visitorId } = req.params;
    if (!widgetId || !visitorId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    // Optimized: getCollection already uses memory cache, but we can still optimize the search
    const allMessages = await getCollection('messages');
    const conversation = allMessages
      .filter(m => (m.visitorId === visitorId || m.recipient === visitorId) && (m.widgetId === widgetId || m.source === 'widget'))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply authentication middleware to all subsequent API routes
router.use(authenticateToken);

/**
 * NEW: Sub-User Management Endpoints
 */
router.get('/users/sub-users', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const allUsers = await getCollection('users');
    const subUsers = allUsers.filter(u => u.parentId === req.user.uid);
    res.json(subUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/sub-users', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { email, password, displayName, permissions } = req.body;
    const allUsers = await getCollection('users');
    
    if (allUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // C-4 FIX: Hash password before storage
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const subUser = {
      uid: 'sub_' + Date.now().toString(36),
      email,
      password: hashedPassword,
      displayName,
      role: 'subuser',
      parentId: req.user.uid,
      permissions: permissions || { features: [], subFeatures: {}, accounts: [] },
      createdAt: new Date().toISOString()
    };

    await setDoc('users', subUser.uid, subUser);
    // Don't return password hash to client
    const { password: _, ...safeSubUser } = subUser;
    res.status(201).json(safeSubUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/sub-users/:uid', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { uid } = req.params;
    const update = req.body;
    
    // Ensure the admin owns this subuser
    const subUser = await getDoc('users', uid);
    if (!subUser || subUser.parentId !== req.user.uid) {
      return res.status(404).json({ error: 'Sub-user not found or access denied' });
    }

    // Hash password if being updated
    if (update.password) {
      update.password = crypto.createHash('sha256').update(update.password).digest('hex');
    }

    const updated = await updateDoc('users', uid, update);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/sub-users/:uid', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { uid } = req.params;
    // Ensure ownership
    const subUser = await getDoc('users', uid);
    if (!subUser || subUser.parentId !== req.user.uid) {
      return res.status(404).json({ error: 'Sub-user not found' });
    }
    await deleteDoc('users', uid);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Upload Route
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      console.error('[Upload] No file provided in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log(`[Upload] Success: ${req.file.filename} saved. Size: ${req.file.size} bytes`);
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('[Upload] Fatal Server Error:', error);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
});

// Real-world Message Sender (Unified)
router.get('/threads/feed', threadsController.getThreads);
router.get('/threads/replies', threadsController.getReplies);
router.post('/threads/replies', threadsController.postReply);
router.get('/threads/conversations', threadsController.getConversations);
router.get('/threads/messages', threadsController.getMessages);
router.post('/threads/send-dm', threadsController.sendDirectMessage);
router.post('/threads/publish', threadsController.publishPost);
router.get('/threads/analytics', threadsController.getAnalytics);
router.delete('/threads/delete', threadsController.deleteThread);
router.post('/threads/profile', threadsController.updateProfile);
router.delete('/threads/accounts/:id', threadsController.disconnectAccount);
router.post('/messages/send', async (req, res) => {
  try {
    const { recipient, text, source, chatId, whatsappAccountId, instagramAccountId, threadsAccountId, campaignId, components, templateName, languageCode } = req.body;
    const uid = getEffectiveUid(req);

    if (!recipient || !text) {
      return res.status(400).json({ error: 'Recipient and text are required' });
    }

    // Source-specific message handling
    // --- 2. HANDLE WHATSAPP MESSAGES ---
    if (source === 'whatsapp') {
      const accounts = await getCollection('whatsapp_accounts');
      let account = whatsappAccountId 
        ? accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid)
        : (accounts.find(acc => acc.uid === uid && acc.status === 'active') || accounts.find(acc => acc.uid === uid));

      if (!account || !account.accessToken || !account.phoneNumberId) {
        return res.status(404).json({ error: 'No active WhatsApp account found' });
      }

      // Construct Meta Payload
      const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: templateName ? 'template' : 'text',
      };

      if (templateName) {
        payload.template = {
          name: templateName,
          language: { code: languageCode || 'en_US' },
          components: components || []
        };
      } else {
        payload.text = { body: text };
      }

      // Call Meta Graph API
      const url = `https://graph.facebook.com/v20.0/${account.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error?.message || 'Meta API Error';
        const fs_sync = await import('fs');
        fs_sync.appendFileSync('server_error.log', `[${new Date().toISOString()}] WhatsApp Send Error (${recipient}): ${JSON.stringify(data)}\n`);
        throw new Error(errorMsg);
      }

      // Save to history
      const msg = {
        uid,
        recipient,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: req.user.displayName || 'Me',
        source: 'whatsapp',
        whatsappAccountId: account.id,
        chatId: chatId || recipient,
        campaignId: campaignId || null,
        timestamp: new Date().toISOString(),
        messageId: data.messages?.[0]?.id,
        status: 'sent',
        unread: true
      };
      await addDoc('messages', msg);

      // ✅ AUTO-HANDOFF: Pause automation for 24h when admin replies
      const profiles = await getCollection('customer_profiles');
      const profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient);
      if (profile) {
        const handoffUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await updateDoc('customer_profiles', profile.id, { 
          status: 'human', 
          handoffUntil,
          lastInteraction: new Date().toISOString()
        });
      }

      return res.json({ success: true, messageId: data.messages?.[0]?.id });
    }

    // --- 3. HANDLE INSTAGRAM MESSAGES ---
    if (source === 'instagram') {
      const accounts = await getCollection('instagram_accounts');
      let account = instagramAccountId
        ? accounts.find(acc => acc.id === instagramAccountId && acc.uid === uid)
        : (accounts.find(acc => acc.uid === uid && acc.status === 'active') || accounts.find(acc => acc.uid === uid));

      if (!account || !account.pageAccessToken) {
        return res.status(404).json({ error: 'Instagram account or Page token not found' });
      }

      // Instagram Messaging API: POST /me/messages
      const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${account.pageAccessToken}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipient },
          message: { text }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Meta Instagram API Error');

      // Save to history
      const msg = {
        uid,
        recipient,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: req.user.displayName || 'Me',
        source: 'instagram',
        instagramAccountId: account.id,
        chatId: chatId || recipient,
        timestamp: new Date().toISOString(),
        messageId: data.message_id,
        status: 'sent',
        unread: true
      };
      await addDoc('messages', msg);

      // ✅ AUTO-HANDOFF: Pause automation for 24h when admin replies
      const profiles = await getCollection('customer_profiles');
      const profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient);
      if (profile) {
        const handoffUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await updateDoc('customer_profiles', profile.id, { 
          status: 'human', 
          handoffUntil,
          lastInteraction: new Date().toISOString()
        });
      }

      return res.json({ success: true, messageId: data.message_id });
    }
    
    // --- 4. HANDLE THREADS MESSAGES ---
    if (source === 'threads') {
      const accounts = await getCollection('threads_accounts');
      let account = threadsAccountId
        ? accounts.find(acc => acc.id === threadsAccountId && acc.uid === uid)
        : accounts.find(acc => acc.uid === uid);

      if (!account || !account.accessToken) {
        return res.status(404).json({ error: 'Threads account not found' });
      }

      // Threads API: Create a reply or new post
      // Note: Inbox usually replies to a parent message (chatId/recipient)
      const isReply = !!recipient && !recipient.startsWith('threads_');
      const apiV = 'v1.0';
      const url = isReply
        ? `https://graph.threads.net/${apiV}/${recipient}/replies?access_token=${account.accessToken}`
        : `https://graph.threads.net/${apiV}/me/threads?access_token=${account.accessToken}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          ...(isReply ? {} : { media_type: 'TEXT' })
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Meta Threads API Error');

      // Save to history
      const msg = {
        uid,
        recipient,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: req.user.displayName || 'Me',
        source: 'threads',
        threadsAccountId: account.id,
        chatId: chatId || recipient,
        timestamp: new Date().toISOString(),
        messageId: data.id,
        status: 'sent'
      };
      await addDoc('messages', msg);

      return res.json({ success: true, id: data.id });
    }

    // --- 4. FALLBACK FOR OTHER SOURCES ---
    const finalMsg = {
      uid,
      recipient,
      text,
      sender: 'admin',
      senderName: 'Admin',
      source: source || 'unknown',
      chatId: chatId || recipient,
      widgetId: req.body.widgetId || undefined,
      timestamp: new Date().toISOString(),
      status: 'sent',
      unread: true
    };
    const result = await addDoc('messages', finalMsg);
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('[SendError]', error);
    res.status(500).json({ error: error.message });
  }
});

// ── INSTAGRAM ACCOUNT SYNC (Refresh from Meta Business) ──────────────────
router.post('/instagram/accounts/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    const uid = getEffectiveUid(req);

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.id === id && acc.uid === uid);

    if (!account) return res.status(404).json({ error: 'Instagram account not found' });

    const token = account.pageAccessToken || account.accessToken;
    if (!token) return res.status(400).json({ error: 'No access token available' });

    // Fetch all real-time data from Meta Graph API
    const igFields = 'username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count,account_type,is_verified';
    const igRes = await fetch(`https://graph.facebook.com/v20.0/${account.instagramId}?fields=${igFields}&access_token=${token}`);
    const igData = await igRes.json();

    if (!igRes.ok) {
      console.error('[IG Sync] Meta API Error:', igData);
      return res.status(igRes.status).json({ error: igData.error?.message || 'Failed to sync from Meta' });
    }

    const updates = {
      username: igData.username || account.username,
      displayName: igData.name || account.displayName,
      biography: igData.biography || '',
      website: igData.website || '',
      profilePicture: igData.profile_picture_url || account.profilePicture,
      followers_count: igData.followers_count || 0,
      follows_count: igData.follows_count || 0,
      media_count: igData.media_count || 0,
      account_type: igData.account_type || 'BUSINESS',
      is_verified: igData.is_verified || false,
      lastSynced: new Date().toISOString()
    };

    await updateDoc('instagram_accounts', id, updates);
    console.log(`[IG Sync] ✅ Refreshed @${updates.username} | Followers: ${updates.followers_count}`);

    res.json({ success: true, account: { ...account, ...updates } });
  } catch (error) {
    console.error('[IG Sync] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── FACEBOOK PAGES MANAGEMENT ───────────────────────────────
router.get('/facebook/pages', async (req, res) => {
  try {
    const uid = getEffectiveUid(req);
    const accounts = await getCollection('instagram_accounts');

    // Sort by lastSynced descending to always use the FRESHEST token
    const userAccounts = accounts
      .filter(acc => acc.uid === uid && acc.accessToken && typeof acc.accessToken === 'string' && acc.accessToken.length > 10)
      .sort((a, b) => new Date(b.lastSynced || 0).getTime() - new Date(a.lastSynced || 0).getTime());

    if (userAccounts.length === 0) {
      return res.status(404).json({ error: 'No Facebook connection found. Please connect your Facebook account first.' });
    }

    // Try each account token until one works (freshest first)
    let fbData = null;
    let lastError = null;

    for (const account of userAccounts) {
      try {
        // Always encodeURIComponent the token to handle any special characters
        const cleanToken = String(account.accessToken).trim();
        const fbRes = await fetch(
          `https://graph.facebook.com/v22.0/me/accounts?fields=name,access_token,category,fan_count,picture{url},instagram_business_account&access_token=${encodeURIComponent(cleanToken)}`
        );
        const data = await fbRes.json();

        if (fbRes.ok) {
          console.log(`[FB Pages] ✅ Token from account ${account.id} (${account.source || 'unknown'}) worked. Found ${data.data?.length || 0} pages.`);
          fbData = data;
          break; // Got a working response, stop trying
        }
        
        lastError = data.error?.message || 'Token failed';
        console.warn(`[FB Pages] ⚠️ Token from account ${account.id} failed: ${lastError}`);
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!fbData) {
      console.error('[FB Pages] All tokens exhausted. Last error:', lastError);
      return res.status(401).json({ 
        error: 'Your Facebook session has expired. Please click "Connect Facebook Account" to reconnect.',
        meta_error: lastError
      });
    }

    const pages = (fbData.data || []).map(p => ({
      ...p,
      isConnected: accounts.some(acc => acc.pageId === p.id && acc.uid === uid)
    }));

    res.json({ success: true, pages });
  } catch (error) {
    console.error('[FB Pages] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/facebook/pages/connect', async (req, res) => {
  try {
    const { pageId, pageAccessToken, pageName, instagramBusinessAccount } = req.body;
    const uid = getEffectiveUid(req);

    if (!pageId || !pageAccessToken) {
      return res.status(400).json({ error: 'Page ID and Access Token are required' });
    }

    // Check if this page is already connected as an Instagram account
    const accounts = await getCollection('instagram_accounts');
    const existing = accounts.find(acc => acc.pageId === pageId && acc.uid === uid);

    const accountData = {
      uid,
      pageId,
      pageAccessToken,
      pageName,
      instagramId: instagramBusinessAccount?.id || null,
      status: 'active',
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString()
    };

    if (existing) {
      await updateDoc('instagram_accounts', existing.id, accountData);
    } else {
      await addDoc('instagram_accounts', accountData);
    }

    res.json({ success: true, message: 'Page connected successfully' });
  } catch (error) {
    console.error('[FB Connect] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Extended Facebook Management ---
router.get('/facebook/pages/:pageId', facebookController.getPageDetails);
router.post('/facebook/pages/publish', facebookController.publishPost);
router.get('/facebook/pages/:pageId/feed', facebookController.getFeed);
router.get('/facebook/posts/:postId/comments', facebookController.getComments);
router.post('/facebook/comments/:commentId/reply', facebookController.replyToComment);
router.get('/facebook/pages/:pageId/analytics', facebookController.getAnalytics);

// Create WhatsApp Template on Meta
router.post('/whatsapp/templates', async (req, res) => {
  try {
    const { name, category, language, components, whatsappAccountId } = req.body;
    const uid = getEffectiveUid(req);

    const missing = [];
    if (!name) missing.push('name');
    if (!category) missing.push('category');
    if (!language) missing.push('language');
    if (!components) missing.push('components');
    if (!whatsappAccountId) missing.push('whatsappAccountId');

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required template fields: ${missing.join(', ')}` });
    }

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid);

    if (!account || !account.accessToken || !account.wabaId) {
      return res.status(404).json({ error: 'No active WhatsApp Business account found' });
    }

    // Prepare components with examples for Meta
    const finalComponents = components.map(c => {
      // 1. Handle Media Headers (Images, Videos, Docs)
      if (c.type === 'HEADER') {
        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
          // If we have a header handle from resumable upload, use it
          if (req.body.headerHandle) {
            return { ...c, example: { header_handle: [req.body.headerHandle] } };
          }
        } else if (c.format === 'TEXT') {
          // If HEADER contains {{1}}, it needs an example
          const placeholders = c.text?.match(/\{\{\d+\}\}/g);
          if (placeholders) {
            return {
              ...c,
              example: { header_text: [placeholders.map((_, i) => `Header Sample ${i + 1}`)] }
            };
          }
        }
      }
      
      // 2. Handle Body Variables ({{1}}, {{2}}, etc)
      if (c.type === 'BODY') {
        const placeholders = c.text.match(/\{\{\d+\}\}/g);
        if (placeholders) {
          return {
            ...c,
            example: {
              body_text: [placeholders.map((_, i) => `Sample Value ${i + 1}`)]
            }
          };
        }
      }

      // 3. Handle Buttons
      if (c.type === 'BUTTONS') {
        return {
          ...c,
          buttons: c.buttons.map(btn => {
            // Authentication Buttons
            if (category === 'AUTHENTICATION' && btn.otp_type === 'COPY_CODE') {
              return {
                type: 'OTP',
                otp_type: 'COPY_CODE',
                text: btn.text || 'Copy Code'
              };
            }
            
            // Standard Buttons Validation
            if (btn.type === 'PHONE_NUMBER') {
              // Ensure phone number starts with country code, no + or spaces for Meta template submission
              const cleanPhone = btn.phone_number?.replace(/\D/g, '');
              return { ...btn, phone_number: cleanPhone };
            }

            return btn;
          })
        };
      }

      return c;
    });

    // Call Meta Graph API to create template
    const response = await fetch(`https://graph.facebook.com/v20.0/${account.wabaId}/message_templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        category,
        language,
        components: finalComponents
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Meta Template API Error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to create template on Meta',
        meta_error: data.error
      });
    }

    // Save to local DB with full Meta context
    const templateDoc = {
      ...req.body,
      uid,
      status: data.status || 'PENDING', // Meta usually returns status here
      metaId: data.id,
      createdAt: new Date().toISOString()
    };
    const result = await addDoc('templates', templateDoc);

    res.status(201).json({ success: true, id: result.id, metaId: data.id });
  } catch (error) {
    console.error('Template Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW: Meta Resumable Upload Route
router.post('/whatsapp/media-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { whatsappAccountId } = req.body;
    const file = req.file;
    const uid = getEffectiveUid(req);

    if (!file || !whatsappAccountId) {
      return res.status(400).json({ error: 'Missing file or account ID' });
    }

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid);

    if (!account || !account.accessToken) {
      return res.status(404).json({ error: 'WhatsApp account not found' });
    }

    // 1. Initialize Upload Session with Meta
    const initRes = await fetch(`https://graph.facebook.com/v20.0/${META_APP_ID}/uploads?file_length=${file.size}&file_type=${file.mimetype}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${account.accessToken}` }
    });
    
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(initData.error?.message || 'Failed to init Meta upload');

    const sessionId = initData.id;

    // 2. Upload the binary data
    const fileContent = fs.readFileSync(file.path);
    const uploadRes = await fetch(`https://graph.facebook.com/v20.0/${sessionId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': file.mimetype
      },
      body: fileContent
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed binary upload to Meta');

    // Clean up local file
    fs.unlinkSync(file.path);

    // Return the handle 'h'
    res.json({ success: true, handle: uploadData.h });
  } catch (error) {
    console.error('Meta Media Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync WhatsApp Templates from Meta
router.get('/whatsapp/templates/sync/:whatsappAccountId', async (req, res) => {
  try {
    const { whatsappAccountId } = req.params;
    const uid = getEffectiveUid(req);

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid);

    if (!account || !account.accessToken || !account.wabaId) {
      return res.status(404).json({ error: 'WhatsApp account not found or missing credentials' });
    }

    // Fetch from Meta
    const response = await fetch(`https://graph.facebook.com/v20.0/${account.wabaId}/message_templates?limit=100`, {
      headers: { 'Authorization': `Bearer ${account.accessToken}` }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch templates from Meta');
    }

    const metaTemplates = data.data || [];
    const localTemplates = await getCollection('templates');

    // Update local statuses based on Meta
    let updatedCount = 0;
    for (const mt of metaTemplates) {
      const local = localTemplates.find(t => t.name === mt.name && t.whatsappAccountId === whatsappAccountId);
      if (local) {
        if (local.status !== mt.status || !local.metaId) {
          await updateDoc('templates', local.id, { 
            status: mt.status, 
            metaId: mt.id, // Ensure Meta ID is saved
            lastUpdated: new Date().toISOString() 
          });
          updatedCount++;
        }
      } else {
        // Optionally import missing templates
        const newTemp = {
          uid,
          whatsappAccountId,
          name: mt.name,
          category: mt.category,
          language: mt.language,
          components: mt.components,
          status: mt.status,
          metaId: mt.id,
          createdAt: new Date().toISOString()
        };
        await addDoc('templates', newTemp);
        updatedCount++;
      }
    }

    res.json({ success: true, synced: metaTemplates.length, updated: updatedCount });
  } catch (error) {
    console.error('Template Sync Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete WhatsApp Template from Meta and Local DB
router.delete('/whatsapp/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uid = getEffectiveUid(req); // L-2 FIX: Support sub-users

    // 1. Find template in local DB
    const template = await getDoc('templates', id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Ensure ownership
    if (template.uid !== uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 2. Find associated WhatsApp Account
    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === template.whatsappAccountId);

    if (!account || !account.accessToken || !account.wabaId) {
       // If account is missing, we still might want to allow local deletion if user insists,
       // but for safety let's assume we need the account to delete from Meta.
       console.warn('[Delete] WhatsApp account missing, deleting from local DB only');
       await deleteDoc('templates', id);
       return res.json({ success: true, note: 'Deleted from local DB only (account not found)' });
    }

    // 3. Call Meta Graph API to delete
    // Meta endpoint: DELETE /{WABA_ID}/message_templates?name={TEMPLATE_NAME}
    // Note: If multiple languages exist, this deletes ALL languages of that template name.
    const metaUrl = `https://graph.facebook.com/v20.0/${account.wabaId}/message_templates?name=${template.name}`;
    const metaRes = await fetch(metaUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${account.accessToken}` }
    });

    const metaData = await metaRes.json();
    
    // 4. Handle Meta Response
    if (!metaRes.ok) {
       // If template doesn't exist on Meta (404 or specific error code), we should still allow local deletion
       if (metaData.error?.code === 100 || metaData.error?.message?.includes('not exist')) {
          console.warn('[Delete] Template did not exist on Meta, removing from local DB');
       } else {
          console.error('[Delete] Meta API Error:', metaData);
          return res.status(metaRes.status).json({ 
            error: metaData.error?.message || 'Failed to delete template from Meta',
            meta_error: metaData.error
          });
       }
    }

    // 5. Delete from local DB
    await deleteDoc('templates', id);

    res.json({ success: true, meta_response: metaData });
  } catch (error) {
    console.error('Template Deletion Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- WhatsApp Flows Management ---

// Create WhatsApp Flow on Meta
router.post('/whatsapp/flows/create', async (req, res) => {
  try {
    const { whatsappAccountId, name, categories, structure } = req.body;
    const uid = req.user.uid;

    if (!whatsappAccountId || !name || !categories) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid);

    if (!account || !account.accessToken || !account.wabaId) {
      return res.status(404).json({ error: 'WhatsApp account not found or missing credentials' });
    }

    // 1. Create the Flow Container
    const createRes = await fetch(`https://graph.facebook.com/v20.0/${account.wabaId}/flows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '').substring(0, 60), 
        categories 
      })
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error('Meta Flow Create Error:', createData);
      return res.status(createRes.status).json({
        error: createData.error?.message || 'Failed to create Flow on Meta',
        meta_error: createData.error
      });
    }

    const flowId = createData.id;

    // 2. Upload Flow Structure (JSON Asset) if provided
    if (structure) {
      const jsonString = JSON.stringify(structure);
      const formData = new FormData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      formData.append('name', 'flow.json');
      formData.append('asset_type', 'FLOW_JSON');
      formData.append('file', blob, 'flow.json');

      const assetRes = await fetch(`https://graph.facebook.com/v20.0/${flowId}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`
        },
        body: formData
      });

      const assetData = await assetRes.json();
      if (!assetRes.ok) {
        console.error('Meta Flow Asset Upload Error:', assetData);
        // Return flow ID but notify about asset failure
        return res.json({ 
          id: flowId, 
          warning: 'Flow created but structure upload failed', 
          meta_error: assetData.error 
        });
      }
      // 3. Automatically Publish the Flow
      const publishRes = await fetch(`https://graph.facebook.com/v20.0/${flowId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`
        }
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok) {
        console.error('Meta Flow Publish Error:', publishData);
        return res.json({ 
          id: flowId, 
          warning: 'Flow created and asset uploaded, but publishing failed. You may need to publish it manually from Meta Business Suite.', 
          meta_error: publishData.error 
        });
      }
    }

    res.status(201).json({ id: flowId, success: true, published: true });
  } catch (error) {
    console.error('WhatsApp Flow Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update WhatsApp Flow Asset (Structure)
router.post('/whatsapp/flows/:id/asset', async (req, res) => {
  try {
    const { id } = req.params; // Meta Flow ID
    const { whatsappAccountId, structure } = req.body;
    const uid = req.user.uid;

    if (!whatsappAccountId || !structure) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === whatsappAccountId && acc.uid === uid);

    if (!account || !account.accessToken) {
      return res.status(404).json({ error: 'WhatsApp account not found or access denied' });
    }

    // Upload Flow Structure (JSON Asset)
    const jsonString = JSON.stringify(structure);
    const formData = new FormData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    formData.append('name', 'flow.json');
    formData.append('asset_type', 'FLOW_JSON');
    formData.append('file', blob, 'flow.json');

    const assetRes = await fetch(`https://graph.facebook.com/v20.0/${id}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`
      },
      body: formData
    });

    const assetData = await assetRes.json();
    if (!assetRes.ok) {
      console.error('Meta Flow Asset Update Error:', assetData);
      return res.status(assetRes.status).json({
        error: assetData.error?.message || 'Failed to update Flow asset on Meta',
        meta_error: assetData.error
      });
    }

    res.json({ success: true, asset_id: assetData.id });
  } catch (error) {
    console.error('WhatsApp Flow Asset Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});



// --- AI & Compliance Routes ---

// Suggest AI Reply
router.post('/ai/suggest', async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Message history is required' });
    }
    const suggestion = await suggestReply(history);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detect Opt-out and auto-blacklist
router.post('/messages/receive', async (req, res) => {
  try {
    const { text, from } = req.body;
    const isOptOut = detectOptOut(text);

    if (isOptOut) {
      // Add to blacklist
      await addDoc('blacklist', {
        phoneNumber: from,
        reason: 'Opt-out keyword detected',
        originalText: text
      });
      return res.json({ success: true, blacklisted: true });
    }

    // Normal message handling...
    res.json({ success: true, blacklisted: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Blacklist for campaign filtering
router.get('/compliance/blacklist', async (req, res) => {
  try {
    const data = await getCollection('blacklist');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// --- AI Agent Extensions ---

/**
 * Provision Agent Metadata from URL
 */
router.get('/agent/provision', authenticateToken, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    console.log(`[API] Provisioning metadata for: ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/i) || 
                      html.match(/<meta property="og:description" content="(.*?)"/i);
    const businessName = titleMatch ? titleMatch[1].split('|')[0].trim() : 'New Business';
    const description = descMatch ? descMatch[1] : 'Automated business description.';
    res.json({ businessName, description });
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract metadata' });
  }
});

/**
 * Get Comprehensive Meta Insights for a Campaign
 */
router.get('/whatsapp/campaigns/:id/insights', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user.uid;

    const campaigns = await getCollection('campaigns');
    const campaign = campaigns.find(c => c.id === id && (c.uid === uid || req.user.role === 'admin'));
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const accounts = await getCollection('whatsapp_accounts');
    const account = accounts.find(acc => acc.id === campaign.whatsappAccountId);
    if (!account) return res.status(404).json({ error: 'WhatsApp account credentials missing' });

    const templates = await getCollection('templates');
    const template = templates.find(t => t.id === campaign.templateId);
    
    // Priority 1: Use category from Template, Priority 2: Use category saved in Campaign, Priority 3: Fallback MARKETING
    const category = template?.category || campaign.templateCategory || 'MARKETING';

    let metaStats = { 
      sent: campaign.totalRecipients || 0, 
      delivered: campaign.successCount || 0, 
      read: campaign.readCount || 0, 
      replied: 0, 
      billedStatus: 'Local Tracker' 
    };
    
    // Attempt real-time sync with Meta Graph API
    if (template?.metaId) {
       try {
         const url = `https://graph.facebook.com/v20.0/${template.metaId}/insights?metric=messages_sent,messages_delivered,messages_read,messages_replied`;
         const metaRes = await fetch(url, {
           headers: { 'Authorization': `Bearer ${account.accessToken}` }
         });
         const metaData = await metaRes.json();
         
         if (metaRes.ok && metaData.data && metaData.data.length > 0) {
            const metrics = metaData.data[0];
            metaStats.sent = metrics.messages_sent || metaStats.sent;
            metaStats.delivered = metrics.messages_delivered || 0;
            metaStats.read = metrics.messages_read || 0;
            metaStats.replied = metrics.messages_replied || 0;
            metaStats.billedStatus = 'Verified by Meta API';
         }
       } catch (metaErr) {
         console.warn('[Sync] Meta API partial reach error:', metaErr.message);
       }
    }

    // Meta Pricing Logic (INR)
    // As per user requirement: "jitana facebook me charge kar ta utan hi lena hai"
    const PRICING_MAP = {
      'MARKETING': 0.8524,  // Exact IN rate for Marketing
      'UTILITY': 0.35,      // Exact IN rate for Utility
      'AUTHENTICATION': 0.35,
      'SERVICE': 0.29
    };
    
    const rate = PRICING_MAP[category.toUpperCase()] || 0.85;
    const actualCost = (metaStats.delivered || metaStats.sent) * rate;

    // Determine Quality Rating from Template Status
    let qualityRating = 'HIGH';
    if (template?.status === 'REJECTED') qualityRating = 'LOW';
    else if (template?.status === 'PAUSED') qualityRating = 'MEDIUM';

    res.json({
      ...metaStats,
      estimatedCost: actualCost, // Total actual cost
      actualRate: rate,
      qualityRating,
      currency: 'INR',
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Insights Sync Fatal:', error);
    res.status(500).json({ error: error.message });
  }
});



/**
 * Sync Agent Knowledge
 */
router.post('/agent/sync/:agentId', authenticateToken, async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await syncAgentKnowledge(agentId);
    if (result.error) return res.status(404).json(result);
    res.json(result);
  } catch (error) {
    console.error('[API] Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync knowledge' });
  }
});

/**
 * Shopify Data Sync
 */
router.post('/shopify/sync', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const pResult = await syncShopifyProducts(uid);
    const oResult = await syncShopifyOrders(uid);
    res.json({ success: true, products: pResult.count, orders: oResult.count });
  } catch (error) {
    console.error('[ShopifySyncRoute] Error:', error);
    res.status(500).json({ error: error.message });
  }
});


// --- WIDGET MANAGEMENT ---
router.get('/widgets', async (req, res) => {
  try {
    const uid = getEffectiveUid(req);
    const widgets = await getCollection('widget_settings');
    res.json(widgets.filter(w => w.uid === uid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/widgets', async (req, res) => {
  try {
    const uid = getEffectiveUid(req);
    const settings = req.body;
    
    if (settings.id) {
      // Update
      const existing = await getDoc('widget_settings', settings.id);
      if (!existing || existing.uid !== uid) return res.status(403).json({ error: 'Access denied' });
      await updateDoc('widget_settings', settings.id, settings);
      return res.json({ success: true, id: settings.id });
    } else {
      // Create
      const widgetId = 'wdg_' + crypto.randomBytes(4).toString('hex');
      const newWidget = {
        ...settings,
        id: widgetId,
        uid,
        createdAt: new Date().toISOString()
      };
      await setDoc('widget_settings', widgetId, newWidget);
      return res.status(201).json({ success: true, id: widgetId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/widgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uid = getEffectiveUid(req);
    const existing = await getDoc('widget_settings', id);
    if (!existing || existing.uid !== uid) return res.status(403).json({ error: 'Access denied' });
    await deleteDoc('widget_settings', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/widget/messages', async (req, res) => {
  try {
    const { visitorId, text, senderName, widgetId } = req.body;
    const uid = getEffectiveUid(req);
    console.log(`[WidgetReply] Start: visitorId=${visitorId}, widgetId=${widgetId}, uid=${uid}`);
    
    // Fallback: If widgetId is missing, try to find it from the visitor's history
    let finalWidgetId = widgetId;
    if (!finalWidgetId) {
      const allMessages = await getCollection('messages');
      // Create a copy before reversing to avoid mutating the original collection if it's cached
      const lastMsg = [...allMessages].reverse().find(m => m.visitorId === visitorId && m.widgetId);
      if (lastMsg) {
        finalWidgetId = lastMsg.widgetId;
        console.log(`[WidgetReply] Found fallback widgetId: ${finalWidgetId}`);
      }
    }
    
    if (!finalWidgetId) {
      console.warn(`[WidgetReply] Warning: No widgetId found for visitor ${visitorId}`);
    }
    
    const messageId = `wdg_reply_${Date.now()}`;
    await setDoc('messages', messageId, {
      id: messageId,
      uid,
      widgetId: finalWidgetId,
      recipient: visitorId,
      visitorId,
      text,
      sender: 'admin',
      direction: 'outbound',
      senderName: senderName || 'Support Agent',
      source: 'widget',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, id: messageId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic GET all documents in a collection
router.get('/:collection', async (req, res) => {
  try {
    const colName = req.params.collection;
    const resolvedName = resolveCollection(colName);
    console.log(`[GenericAPI] GET /${colName} (Resolved: ${resolvedName})`);
    
    let data = await getCollection(resolvedName);
    console.log(`[GenericAPI] Found ${data.length} items`);
    
    const collection = resolveCollection(req.params.collection);
    const isMessages = collection === 'messages' || collection === 'ms-c';
    
    // Optimized Cache headers
    res.set('Cache-Control', isMessages ? 'no-store' : 'private, max-age=30');

    // --- PERMISSION-BASED FILTERING ---
    const role = req.user.role;
    const uid = getEffectiveUid(req);
    const parentId = req.user.parentId;
    const permissions = req.user.permissions || { accounts: [], features: [] };

    // Safety check for data type
    if (!Array.isArray(data)) {
       console.error(`[GenericAPI] Error: Data for ${collection} is not an array!`, typeof data);
       return res.status(500).json({ error: `Internal error: collection ${collection} data is not an array` });
    }
    
    if (role !== 'admin') {
      const assignedAccounts = permissions.accounts || [];
      const filterByUid = (item) => item && (item.uid === uid || item.createdBy === uid || (parentId && (item.uid === parentId || item.createdBy === parentId)));

      if (role === 'subuser') {
        if (collection === 'whatsapp_accounts' || collection === 'instagram_accounts' || collection === 'threads_accounts') {
          data = data.filter(acc => acc && assignedAccounts.includes(acc.id));
        } else if (['campaigns', 'messages', 'templates', 'whatsapp_flows', 'chat_flows_threads'].includes(collection)) {
          data = data.filter(item => 
            item && (
              assignedAccounts.includes(item.whatsappAccountId) || 
              assignedAccounts.includes(item.instagramAccountId) ||
              filterByUid(item)
            )
          );
        } else {
          data = data.filter(item => filterByUid(item));
        }
      } else {
        data = data.filter(item => filterByUid(item));
      }
    }

    // --- QUERY PARAMETER FILTERING (Isolation Hardening) ---
    const queryParams = req.query;
    Object.keys(queryParams).forEach(key => {
      // Skip auth token and other non-data parameters
      if (['token', 'tokenExpired'].includes(key)) return;
      
      const filterVal = queryParams[key];
      if (filterVal) {
        data = data.filter(item => item && String(item[key]) === String(filterVal));
      }
    });

    res.json(data);
  } catch (error) {
    console.error(`[GenericAPI Error] ${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Specific route to mimic Firebase onAuthStateChanged
router.get('/auth/me', async (req, res) => {
  try {
    const user = await getDoc('users', req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Don't leak DB password
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic GET a single document by ID
router.get('/:collection/:id', async (req, res) => {
  try {
    const data = await getDoc(resolveCollection(req.params.collection), req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic POST a new document to a collection
router.post('/:collection', async (req, res) => {
  try {
    // Automatically inject createdAt and user metadata if we want
    const data = { ...req.body, createdBy: req.user.uid, createdAt: new Date().toISOString() };
    const result = await addDoc(resolveCollection(req.params.collection), data);
    res.status(201).json(result);
  } catch (error) {
    console.error(`[API] Error in POST /${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Generic PUT/Update a specific document
router.put('/:collection/:id', async (req, res) => {
  try {
    const resolvedCollectionName = resolveCollection(req.params.collection);
    console.log(`[API] PUT Request: Collection=${req.params.collection} (${resolvedCollectionName}), ID=${req.params.id}`);
    
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    const result = await updateDoc(resolvedCollectionName, req.params.id, data);
    res.json(result);
  } catch (error) {
    console.error(`[API] Error in PUT /${req.params.collection}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Generic DELETE a specific document
router.delete('/:collection/:id', async (req, res) => {
  try {
    const result = await deleteDoc(resolveCollection(req.params.collection), req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

