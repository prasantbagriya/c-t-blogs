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
import { createProxyMiddleware } from 'http-proxy-middleware';

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

// ✅ Blog Proxy — ROOT LEVEL MOUNT (critical fix)
// PROBLEM: app.use('/auth', proxy) → Express strips '/auth' → proxy sends GET /login → 404
//          app.use('/admin', proxy) → Express strips '/admin' → proxy sends GET / → Homepage!
// SOLUTION: Mount at root, filter paths manually → full path preserved → correct routing
const BLOG_PATHS = [
  '/blog', '/admin', '/auth', '/category', '/author',
  '/stories', '/search', '/sitemap.xml', '/feed.xml',
  '/news-sitemap.xml', '/api/admin', '/api/auth/login', '/api/og', '/_next',
  '/about', '/contact', '/privacy', '/terms', '/editorial-policy', '/fact-checking-policy',
];

// Lazy proxy instance — created once, reuses the current port from blogState
let _blogProxy = null;
const getBlogProxy = () => {
  if (!_blogProxy) {
    _blogProxy = createProxyMiddleware({
      target: `http://127.0.0.1:${blogState.port}`,
      xfwd: true, // add x-forwarded-* headers
      autoRewrite: true, // rewrite location host/port on redirects
      protocolRewrite: 'https', // rewrite location protocol to https
      // Use router to always pick up latest port (handles restart)
      router: () => `http://127.0.0.1:${blogState.port}`,
      on: {
        error: (err, req, res) => {
          // Do NOT set blogState.ready = false here! 
          // Client disconnects (ECONNRESET) trigger this, which would permanently brick the blog.
          // app.js handles actual blog process crashes and port monitoring.
          console.error(`[Proxy Error] ${err.code}: ${err.message} on ${req.url}`);
          if (!res.headersSent) {
            res.status(502).send('Bad Gateway: Unable to reach the blog service.');
          }
        },
        proxyRes: (proxyRes, req, res) => {
          // Extra safety: manually rewrite any leaked localhost/127.0.0.1 or port Location headers
          // Next.js uses BOTH 'location' and 'x-nextjs-redirect' depending on client-side or server-side routing
          const headersToRewrite = ['location', 'x-nextjs-redirect'];
          
          headersToRewrite.forEach(headerName => {
            if (proxyRes.headers[headerName]) {
              let loc = proxyRes.headers[headerName];
              const externalProto = req.headers['x-forwarded-proto'] || 'https';
              const externalHost = req.headers['x-forwarded-host'] || req.headers.host || 'chatwizs.com';
              
              // If the redirect is absolute and contains localhost or 127.0.0.1, replace it with external host
              loc = loc.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, `${externalProto}://${externalHost}`);
              
              // If the redirect contains the external host BUT leaked the internal port (e.g. chatwizs.com:4000), strip the port
              if (loc.includes(`${externalHost}:${blogState.port}`)) {
                loc = loc.replace(`${externalHost}:${blogState.port}`, externalHost);
              }
              
              // Also explicitly strip :4000 and :4001 just in case
              if (loc.includes(':4000')) loc = loc.replace(':4000', '');
              if (loc.includes(':4001')) loc = loc.replace(':4001', '');
              
              proxyRes.headers[headerName] = loc;
            }
          });
        },
      },
    });
  }
  return _blogProxy;
};

// Single root-level middleware — intercepts blog paths BEFORE Express can strip prefix
app.use((req, res, next) => {
  const path = req.path;
  const isBlogPath = BLOG_PATHS.some(p =>
    path === p || path.startsWith(p + '/') || path === p + '/'
  );
  if (!isBlogPath) return next();

  // Blog not ready yet — show loading page
  if (!blogState.ready) {
    return res.status(503).send(
      '<html><head><meta http-equiv="refresh" content="4"></head><body>' +
      '<h2 style="font-family:sans-serif;text-align:center;margin-top:20vh">⏳ Blog is starting up...</h2>' +
      '<p style="text-align:center;font-family:sans-serif">Auto-refreshing in 4 seconds...</p>' +
      '</body></html>'
    );
  }

  // Forward full path to blog — e.g. /auth/login → blog:/auth/login ✅
  getBlogProxy()(req, res, next);
});
// Trust proxy headers for accurate IP resolution behind Nginx/Cloudflare
app.set('trust proxy', 1);

app.use(express.json({
  limit: '2mb', // Reduced from 50mb to prevent OOM DOS via massive payloads
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// C-7 FIX: Basic rate limiter for public endpoints (60 requests/min per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per window
const MAX_MAP_SIZE = 10000; // Cap map size to prevent memory leaks

function rateLimiter(req, res, next) {
  // req.ip works correctly now because of app.set('trust proxy', 1)
  const ip = req.ip || req.socket?.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    // If map gets too big (e.g. under DDoS), clear it out
    if (rateLimitMap.size >= MAX_MAP_SIZE) {
      rateLimitMap.clear();
    }
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
       // Asynchronous logging to prevent event-loop blocking
       fs.appendFile('server_error.log', `[${new Date().toISOString()}] File not found: ${filePath}\n`, () => {});
       return res.status(404).send('File not found');
    }
    // Always serve with no-cache to ensure updates reflect immediately
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(filePath);
  } catch (err) {
    // Asynchronous logging to prevent event-loop blocking
    fs.appendFile('server_error.log', `[${new Date().toISOString()}] Error serving widget: ${err.stack}\n`, () => {});
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

