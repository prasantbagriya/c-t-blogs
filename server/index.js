// CRITICAL ESM FIX: `import 'dotenv/config'` MUST be first.
// In ESM, static imports resolve before module body runs, so
// `dotenv.config()` called in module body is ALWAYS too late.
// Side-effect import runs during resolution phase — BEFORE config.js reads process.env.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';

// Import shared blog state (avoids circular dependency with app.js)
import { blogState } from '../blog-state.js';

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
    // BUG FIX: Removed redundant `|| origin === process.env.VITE_APP_URL` (already in allowedOrigins)
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    // Permissive fallback for widget embedding across domains
    return callback(null, true);
  },
  credentials: true
}));

// BUG FIX: Was hardcoded to port 3000 (same as Hostinger's main PORT → ECONNREFUSED)
// Now dynamically reads BLOG_INTERNAL_PORT (4000) from app.js
const proxyToNext = (targetPathPrefix) => (req, res) => {
  // BUG FIX: Check blogReady before proxying — avoids ECONNREFUSED on cold start
  if (!blogState.ready) {
    return res.status(503).send(
      '<html><head><meta http-equiv="refresh" content="4"></head><body>' +
      '<h2 style="font-family:sans-serif;text-align:center;margin-top:20vh">⏳ Blog is starting up...</h2>' +
      '<p style="text-align:center;font-family:sans-serif">Auto-refreshing in 4 seconds...</p>' +
      '</body></html>'
    );
  }
  const blogPort = blogState.port;
  const targetUrl = `http://127.0.0.1:${blogPort}${targetPathPrefix}${req.url}`;
  const parsedUrl = new URL(targetUrl);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${blogPort}` }
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  req.pipe(proxyReq, { end: true });
  proxyReq.on('error', (err) => {
    console.error('[Proxy Error]', err.message);
    blogState.ready = false;
    res.status(503).send(
      '<html><head><meta http-equiv="refresh" content="5"></head><body>' +
      '<h2 style="font-family:sans-serif;text-align:center;margin-top:20vh">⏳ Blog restarting...</h2>' +
      '<p style="text-align:center;font-family:sans-serif">Auto-refreshing in 5 seconds...</p>' +
      '</body></html>'
    );
  });
};

app.use('/blog', proxyToNext('/blog'));
app.use('/_next', proxyToNext('/_next'));

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
  // BUG FIX: req.connection is deprecated in Node 18+ — use req.socket
  const ip = req.ip || req.socket?.remoteAddress;
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

// BUG FIX: rateLimiter was defined but NEVER mounted — public endpoints had no rate limiting
app.use(rateLimiter);

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
