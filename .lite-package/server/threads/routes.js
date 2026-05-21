import express from 'express';
import {
  exchangeCode,
  getProfile,
  updateProfile,
  getThreads,
  publishPost,
  getAnalytics,
  getReplies,
  postReply,
  getConversations,
  getMessages,
  sendDirectMessage,
  disconnectAccount,
  deleteThread
} from './controller.js';
import threadsWebhooks from './webhooks.js';

import multer from 'multer';
import path from 'path';
import { UPLOAD_DIR, THREADS_APP_ID } from '../config.js';

const router = express.Router();

// Multer Config for Threads Media
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `threads_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ── WEBHOOKS (Meta Compliance) ──────────────────────────────────────────────
router.use('/webhooks', threadsWebhooks);

// ── AUTH ─────────────────────────────────────────────────────────────────────
router.get('/connect', (req, res) => {
  const clientId = THREADS_APP_ID;
  
  // Clean origin and ensure no trailing slash
  let origin = req.query.origin || `${req.protocol}://${req.get('host')}`;
  origin = origin.replace(/\/$/, ''); 
  
  const redirectUri = encodeURIComponent(`${origin}/threads-callback`);
  const scope = 'threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies,threads_manage_insights';
  
  // Use www.threads.net and force_login=true to stay in browser on mobile
  const authUrl = `https://www.threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&force_login=true`;
  
  console.log('--------------------------------------------------');
  console.log('[Threads OAuth Attempt]');
  console.log(`- Origin: ${origin}`);
  console.log(`- Redirect URI: ${decodeURIComponent(redirectUri)}`);
  console.log(`- Final Auth URL: ${authUrl}`);
  console.log('--------------------------------------------------');
  
  res.redirect(authUrl);
});

router.post('/callback', exchangeCode);

// ── ACCOUNT & MEDIA ──────────────────────────────────────────────────────────
router.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

router.get('/me', getProfile);
router.get('/profile', getProfile); // Alias for frontend
router.post('/profile', updateProfile);
router.delete('/accounts/:id', disconnectAccount);

// ── CONTENT ──────────────────────────────────────────────────────────────────
router.get('/threads', getThreads);
router.get('/feed', getThreads); // Alias for frontend
router.post('/publish', publishPost);
router.delete('/delete', deleteThread);

// ── REPLIES ──────────────────────────────────────────────────────────────────
router.get('/replies', getReplies);
router.post('/replies', postReply);
router.delete('/replies/:threadId', deleteThread);

// ── MESSAGING (DMs) ──────────────────────────────────────────────────────────
router.get('/conversations', getConversations);
router.get('/messages', getMessages);
router.post('/send-dm', sendDirectMessage);

// ── ANALYTICS ────────────────────────────────────────────────────────────────
router.get('/analytics', getAnalytics);

export default router;
