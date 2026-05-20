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
import { UPLOAD_DIR } from '../config.js';

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
