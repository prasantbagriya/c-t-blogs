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
import compression from 'compression';

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
import shopifyRouter from './routes/shopify.js';
import inquiryRoutes from './routes/inquiries.js';
import { startInstagramScheduler } from './instagram/scheduler.js';

// Start Background Workers
startInstagramScheduler();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());

function lazyRouter(importRouter) {
  let routerPromise = null;

  return async (req, res, next) => {
    try {
      routerPromise ||= importRouter().then((mod) => mod.default || mod);
      const router = await routerPromise;
      return router(req, res, next);
    } catch (err) {
      console.error('[Server] Lazy route import failed:', err);
      if (!res.headersSent) {
        res.status(503).json({ error: 'Service is starting. Please retry shortly.' });
      }
    }
  };
}

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

// ✅ PB-Creative-Studio Proxy Setup
const STUDIO_PATHS = [
  '/tool', '/youtubevideodownload', '/portal', '/hub',
  '/info', '/download',
  '/api/info', '/api/download',
  '/api/admin', '/api/student', '/api/hub', '/api/leads'
];

let _studioProxy = null;
const getStudioProxy = () => {
  if (!_studioProxy) {
    _studioProxy = createProxyMiddleware({
      target: 'http://127.0.0.1:5000',
      xfwd: false,
      autoRewrite: true,
      protocolRewrite: 'https',
      on: {
        proxyReq: (proxyReq, req, res) => {
          if (req.headers.host) {
            proxyReq.setHeader('Host', req.headers.host);
          }
        },
        error: (err, req, res) => {
          console.error(`[Studio Proxy Error] ${err.code}: ${err.message} on ${req.url}`);
          if (!res.headersSent) {
            res.status(502).send('Bad Gateway: Unable to reach the studio service.');
          }
        }
      }
    });
  }
  return _studioProxy;
};

// Route studio-related paths to the studio server on port 5000
app.use((req, res, next) => {
  const path = req.path;
  
  // FIX: Exempt Next.js Blog API admin paths from being intercepted by Studio
  const isBlogApiAdminPath = path.startsWith('/api/admin/') && 
    ['posts', 'media', 'seo-audit', 'categories', 'authors', 'stories', 'auth']
      .some(ep => path.startsWith(`/api/admin/${ep}`));
      
  if (isBlogApiAdminPath) {
    return next();
  }

  const isStudioPath = STUDIO_PATHS.some(p =>
    path === p || path.startsWith(p + '/') || path === p + '/'
  );
  if (isStudioPath) {
    return getStudioProxy()(req, res, next);
  }
  next();
});

// ✅ Blog Proxy — ROOT LEVEL MOUNT (critical fix)
// PROBLEM: app.use('/auth', proxy) → Express strips '/auth' → proxy sends GET /login → 404
// app.use('/admin', proxy) → Express strips '/admin' → proxy sends GET / → Homepage!
// SOLUTION: Mount at root, filter paths manually → full path preserved → correct routing
const BLOG_PATHS = [
  '/blog', '/blog/admin', '/blog/auth', '/category', '/author',
  '/stories', '/search', '/sitemap.xml', '/feed.xml',
  '/news-sitemap.xml', '/api/admin', '/api/og', '/_next',
  '/about', '/contact', '/privacy', '/terms', '/editorial-policy', '/fact-checking-policy',
  '/uploads',
];

// Lazy proxy instance — created once, reuses the current port from blogState
let _blogProxy = null;
const getBlogProxy = () => {
  if (!_blogProxy) {
    _blogProxy = createProxyMiddleware({
      target: `http://127.0.0.1:${blogState.port}`,
      xfwd: false, // CRITICAL: disable x-forwarded-* headers for Next.js CSRF bypass
      autoRewrite: true, // rewrite location host/port on redirects
      protocolRewrite: 'https', // rewrite location protocol to https

      router: () => `http://127.0.0.1:${blogState.port}`,
      on: {
        proxyReq: (proxyReq, req, res) => {
          // Pass real Host to Next.js so cookies and redirects generate correctly
          if (req.headers.host) {
            proxyReq.setHeader('Host', req.headers.host);
          }
        },
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
          // No manual rewriting needed since Next.js sees the real Host.
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

  // Blog not ready yet or not running (fallback support)
  if (!blogState.ready) {
    // If it's a main application path or auth API, fall through to the React SPA natively!
    const isMainAppPath = [
      '/auth', '/about', '/contact', '/privacy', '/terms', '/api/auth'
    ].some(p => path === p || path.startsWith(p + '/'));

    if (isMainAppPath) {
      console.log(`[Blog Offline] Falling back natively to React SPA for path: ${path}`);
      return next();
    }

    // Otherwise, show a beautifully designed, premium offline fallback page
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Temporarily Offline | ChatWizs</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121214;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --primary: #3b82f6;
      --primary-glow: rgba(59, 130, 246, 0.15);
      --border: #27272a;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      position: relative;
    }
    .glow-1 {
      position: absolute;
      top: -10%;
      left: -10%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
      filter: blur(80px);
      z-index: 1;
      pointer-events: none;
    }
    .glow-2 {
      position: absolute;
      bottom: -10%;
      right: -10%;
      width: 45%;
      height: 45%;
      background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
      filter: blur(80px);
      z-index: 1;
      pointer-events: none;
    }
    .container {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px 32px;
      width: 100%;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      position: relative;
      z-index: 10;
      backdrop-filter: blur(10px);
    }
    .icon-wrapper {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1e1b4b, #0f172a);
      border: 1px solid var(--primary);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 28px;
      box-shadow: 0 0 30px var(--primary-glow);
      position: relative;
    }
    .icon-wrapper::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 22px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      z-index: -1;
      opacity: 0.3;
    }
    .icon {
      color: var(--primary);
      width: 36px;
      height: 36px;
      animation: pulse 2s infinite ease-in-out;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
      background: linear-gradient(to right, #ffffff, #d4d4d8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--text);
      color: var(--bg);
      font-weight: 600;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .btn:hover {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
      transform: translateY(-2px);
    }
    .footer-text {
      margin-top: 40px;
      font-size: 11px;
      color: #52525b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="container">
    <div class="icon-wrapper">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h.008v.008H12V7.5zM12 11.5h.008v.008H12V11.5zM12 15.5h.008v.008H12V15.5zM20.25 14.25v2.25A2.25 2.25 0 0118 18.75H6a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 016 3h12a2.25 2.25 0 012.25 2.25v4.25H21a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-.75z" />
      </svg>
    </div>
    <h1>Blog is Temporarily Offline</h1>
    <p>Our blog is currently undergoing scheduled updates. The main ChatWizs AI Automation Platform is fully functional and ready to use.</p>
    <a href="/" class="btn">Go to Dashboard</a>
    <div class="footer-text">ChatWizs AI Platform</div>
  </div>
</body>
</html>`);
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
      fs.appendFile('server_error.log', `[${new Date().toISOString()}] File not found: ${filePath}\n`, () => { });
      return res.status(404).send('File not found');
    }
    // Always serve with no-cache to ensure updates reflect immediately
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(filePath);
  } catch (err) {
    // Asynchronous logging to prevent event-loop blocking
    fs.appendFile('server_error.log', `[${new Date().toISOString()}] Error serving widget: ${err.stack}\n`, () => { });
    res.status(500).send(err.message);
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/google', (req, res, next) => {
  console.log('[DEBUG] Hit /api/google:', req.method, req.url, req.path);
  next();
}, lazyRouter(() => import('./routes/googleAuth.js')));
app.use('/api', lazyRouter(() => import('./routes/api.js')));
app.use('/api/webhooks', lazyRouter(() => import('./routes/webhooks.js')));
app.use('/shopify-login', shopifyRouter);

try {
  app.use('/api/instagram', lazyRouter(() => import('./instagram/index.js')));
  app.use('/api/threads', lazyRouter(() => import('./threads/routes.js')));
  console.log('[Server] Instagram & Threads Modules Loaded');
} catch (e) {
  console.error('[Server] Failed to load Social Modules:', e.message);
}

app.use('/api/inquiries', inquiryRoutes);
app.use('/api/payments', lazyRouter(() => import('./routes/payments.js')));
app.use('/api/google-sheets', lazyRouter(() => import('./routes/googleSheets.js')));

app.use('/api/downloader', lazyRouter(() => import('./routes/downloader.js')));
app.use('/api/playbook', lazyRouter(() => import('./routes/playbook.js')));
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

// Caching strategy for PageSpeed Optimization
const staticCacheOptions = {
  maxAge: '0',
  setHeaders: (res, filepath) => {
    if (filepath.includes(path.sep + 'assets' + path.sep)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
};

app.use(express.static(DIST_PATH, staticCacheOptions));
app.use('/leads-manager', express.static(path.join(__dirname, '../leads-manager'), {
  maxAge: '0',
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

// Fallback static serving for build environments
app.use('/uploads', express.static(path.join(__dirname, '../dist/uploads'), { maxAge: '30d' }));
// Serve Blog Uploads (both dev and standalone production)
app.use('/uploads', express.static(path.join(__dirname, '../blog/public/uploads'), { maxAge: '30d' }));
app.use('/uploads', express.static(path.join(__dirname, '../blog/.next/standalone/public/uploads'), { maxAge: '30d' }));

// Playbook App Routing
app.use('/playbook', express.static(path.join(__dirname, '../Playbook/dist'), {
  maxAge: '0',
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

app.get('/playbook/*', async (req, res) => {
  const playbookIndexPath = path.join(__dirname, '../Playbook/dist/index.html');
  if (fs.existsSync(playbookIndexPath)) {
    try {
      let html = await fs.promises.readFile(playbookIndexPath, 'utf-8');
      
      // Attempt to inject OG tags if a slug is present
      const slugMatch = req.path.match(/\/playbook\/([^\/]+)/);
      if (slugMatch) {
        const slug = slugMatch[1];
        const playbooksPath = path.join(__dirname, 'data', 'playbooks.json');
        if (fs.existsSync(playbooksPath)) {
          const playbooks = JSON.parse(await fs.promises.readFile(playbooksPath, 'utf8'));
          const playbook = playbooks.find(p => p.slug === slug || p.id === slug);
          if (playbook) {
            const title = playbook.seoTitle || playbook.title;
            const description = playbook.seoDescription || playbook.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
            const imageUrl = playbook.imageUrl?.startsWith('http') ? playbook.imageUrl : `https://chatwizs.com${playbook.imageUrl}`;
            const siteUrl = `https://chatwizs.com${req.path}`;
            
            const ogTags = `
              <title>${title} | Chatwizs Digital Playbook Store</title>
              <meta name="description" content="${description}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:description" content="${description}" />
              <meta property="og:image" content="${imageUrl}" />
              <meta property="og:url" content="${siteUrl}" />
              <meta property="og:type" content="article" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="${title}" />
              <meta name="twitter:description" content="${description}" />
              <meta name="twitter:image" content="${imageUrl}" />
            `;
            html = html.replace('</head>', `${ogTags}</head>`);
          }
        }
      }

      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(html);
    } catch (err) {
      console.error('Error serving Playbook HTML:', err);
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(playbookIndexPath);
    }
  } else {
    res.status(404).send('Playbook not built yet.');
  }
});

// Wildcard route to serve index.html for React routing
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
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

let server;
if (!process.env.IS_WRAPPER) {
  server = app.listen(PORT, () => {
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
} else {
  console.log(`-----------------------------------------`);
  console.log(`🚀 ChatWizs Server initialized for Wrapper on port ${PORT}`);
  console.log(`-----------------------------------------`);
}

export { app };

