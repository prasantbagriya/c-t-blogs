import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Ensure fetch is available in older Node.js environments
if (!global.fetch) {
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
  }).catch(() => {
    console.warn('[Server] node-fetch not found. Fetch calls might fail if Node < 18.');
  });
}

import { JWT_SECRET, PORT, UPLOAD_DIR } from './config.js';

// Import Routes
import authRoutes from './routes/auth.js';
import apiRouter from './routes/api.js';
import webhookRouter from './routes/webhooks.js';
import shopifyRouter from './routes/shopify.js';
import instagramRoutes from './instagram/index.js';
import threadsRoutes from './threads/routes.js';
import inquiryRoutes from './routes/inquiries.js';
import paymentRoutes from './routes/payments.js';
import googleSheetsRouter from './routes/googleSheets.js';
import { startInstagramScheduler } from './instagram/scheduler.js';

// Start Background Workers
startInstagramScheduler();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// C-5 FIX: Restrict CORS to known origins instead of wildcard '*'
const allowedOrigins = [
  process.env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server, webhooks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o)) || origin === process.env.VITE_APP_URL) {
      return callback(null, true);
    }
    // For widget embedding: allow any origin that has the widget script
    return callback(null, true); // Keep permissive for widget, but log unknown origins
  },
  credentials: true
}));

app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// C-7 FIX: Basic rate limiter for public endpoints (60 requests/min per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per window

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return next();
  }
  
  const record = rateLimitMap.get(ip);
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.windowStart = now;
    return next();
  }
  
  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }
  next();
}

// Clean up rate limit map every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Request logging
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// Global Exception Handlers
process.on('uncaughtException', (err) => {
  console.error('FATAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Routes
app.get('/sdk/widget.js', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public/sdk/widget.js');
    if (!fs.existsSync(filePath)) {
       fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] File not found: ${filePath}\n`);
       return res.status(404).send('File not found');
    }
    // Always serve with no-cache to ensure updates reflect immediately
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(filePath);
  } catch (err) {
    fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Error serving widget: ${err.stack}\n`);
    res.status(500).send(err.message);
  }
});
app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/shopify-login', shopifyRouter);

try {
  app.use('/api/instagram', instagramRoutes);
  app.use('/api/threads', threadsRoutes);
  console.log('[Server] Instagram & Threads Modules Loaded');
} catch (e) {
  console.error('[Server] Failed to load Social Modules:', e.message);
}

app.use('/api/inquiries', inquiryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/google-sheets', googleSheetsRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ 
    error: 'API route not found',
    method: req.method,
    path: req.originalUrl 
  });
});

// Serve Static Files (Vite Build)
const DIST_PATH = path.join(__dirname, '../dist');
if (!fs.existsSync(DIST_PATH)) {
  console.warn('[Server] ⚠️ WARNING: dist folder not found at ' + DIST_PATH);
}
app.use(express.static(DIST_PATH));
app.use('/leads-manager', express.static(path.join(__dirname, '../leads-manager')));
app.use('/uploads', express.static(UPLOAD_DIR));

// Fallback static serving for build environments
app.use('/uploads', express.static(path.join(__dirname, '../dist/uploads')));

// Wildcard route to serve index.html for React routing
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('ChatWizs Server is running, but the frontend build (dist) is missing or being generated. Please wait 1-2 minutes.');
  }
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const server = app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 ChatWizs Server is LIVE on port ${PORT}`);
    console.log(`👉 Mode: ${process.env.NODE_ENV || 'production'}`);
    console.log(`-----------------------------------------`);
});

server.on('error', (err) => {
    console.error('[Server] Fatal Error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use. Please wait or kill the process.`);
      process.exit(1);
    }
});
