import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  exchangeCode,
  deauthorize,
  deleteData,
  syncAccount,
  disconnectAccount,
  publishContent,
  getPosts,
  getComments,
  replyToComment,
  deleteComment,
  hideComment,
  getAnalytics,
  optimizeProfile,
  schedulePost,
  getScheduled,
  cancelScheduled,
  verifyWebhook,
  handleWebhookEvents
} from './controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── MULTER: File Upload Config ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ig_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only JPEG, PNG, WebP, MP4 allowed.'));
  }
});

// ── AUTH CALLBACKS (Public — no JWT) ─────────────────────────────────────────
router.post('/callback', exchangeCode);
router.post('/deauthorize', deauthorize);
router.post('/delete-data', deleteData);

// ── WEBHOOK (Public — Meta signs these) ──────────────────────────────────────
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhookEvents);

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
router.get('/status', (req, res) => res.json({ status: 'Instagram module active', routes: router.stack.map(r => r.route?.path).filter(Boolean) }));

// ── ACCOUNT MANAGEMENT ───────────────────────────────────────────────────────
router.post('/accounts/:id/sync', syncAccount);
router.delete('/accounts/:id', disconnectAccount);

// ── CONTENT PUBLISHING ───────────────────────────────────────────────────────
router.post('/publish', upload.single('file'), publishContent);

// ── POSTS ─────────────────────────────────────────────────────────────────────
router.get('/posts', getPosts);

// ── COMMENTS ─────────────────────────────────────────────────────────────────
router.get('/comments', getComments);
router.post('/comments/:id/reply', replyToComment);
router.post('/comments/:id/hide', hideComment);
router.delete('/comments/:id', deleteComment);

// ── ANALYTICS & SEO ─────────────────────────────────────────────────────────
router.get('/analytics', getAnalytics);
router.post('/optimize', optimizeProfile);

// ── SCHEDULER ────────────────────────────────────────────────────────────────
router.post('/schedule', upload.single('file'), schedulePost);
router.get('/scheduled', getScheduled);
router.delete('/scheduled/:id', cancelScheduled);

export default router;
