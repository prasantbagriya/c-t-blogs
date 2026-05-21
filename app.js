/**
 * ChatWizs Production Entrypoint (app.js)
 *
 * Blog Strategy: Runs Next.js standalone server.js as a child process on
 * internal port BLOG_PORT (default: 4000). Express proxies /blog and /_next
 * to this port.
 *
 * KEY FIX: Blog uses port 4000 (NOT 3000) because Hostinger assigns PORT=3000
 * to the main Express server — using the same port causes EADDRINUSE crash
 * and subsequent ECONNREFUSED errors on every blog request.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';
import net from 'net';
import { blogState } from './blog-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Entry] Initializing ChatWizs Single-Unit Deployment...');

// ─── BLOG STANDALONE LAUNCHER ────────────────────────────────────────────────
const BLOG_PORT = blogState.port;
const blogStandaloneDir    = path.join(__dirname, 'blog', '.next', 'standalone');
const blogStandaloneServer = path.join(blogStandaloneDir, 'server.js');

/** Returns true if something is already listening on this port. */
const isPortInUse = (port, host = '127.0.0.1') =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error',   () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });

/** Waits until the blog's port is accepting TCP connections. */
const waitForPort = (port, host = '127.0.0.1', timeout = 30000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('error',   () => {
        socket.destroy();
        if (Date.now() - start >= timeout)
          return reject(new Error(`Port ${port} not reachable after ${timeout}ms`));
        setTimeout(check, 500);
      });
      socket.once('timeout', () => { socket.destroy(); setTimeout(check, 500); });
      socket.connect(port, host);
    };
    check();
  });

const launchBlogStandalone = async () => {
  if (!fs.existsSync(blogStandaloneServer)) {
    console.warn('[Blog] ⚠️  Standalone server.js not found at:', blogStandaloneServer);
    console.warn('[Blog] Blog routes (/blog) will return 503.');
    return;
  }

  // KEY FIX: Hostinger runs multiple app instances simultaneously.
  // If port 4000 is already taken by a sibling instance's blog, do NOT
  // spawn another — just mark this instance as ready and use the existing one.
  const alreadyRunning = await isPortInUse(BLOG_PORT);
  if (alreadyRunning) {
    console.log(`[Blog] ✅ Port ${BLOG_PORT} already in use by another instance. Reusing existing blog.`);
    blogState.ready = true;
    return;
  }

  console.log(`[Blog] Launching Next.js standalone on internal port ${BLOG_PORT}...`);
  console.log('[Blog] Using node binary:', process.execPath);

  // CRITICAL FIX: Pass absolute paths for data/ and public/uploads/
  // so the standalone blog always reads/writes to the SAME location
  // regardless of its cwd (blog/.next/standalone/).
  // Without this, posts added locally won't appear after deploy.
  const blogDataDir = path.join(__dirname, 'blog', 'data');
  const blogUploadsDir = path.join(__dirname, 'blog', 'public', 'uploads');

  const blogProcess = spawn(process.execPath, [blogStandaloneServer], {
    cwd: blogStandaloneDir,
    shell: false,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(BLOG_PORT),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      // Override data/uploads paths to use blog root (not standalone copy)
      BLOG_DATA_DIR: blogDataDir,
      BLOG_UPLOADS_DIR: blogUploadsDir,
    },
  });

  blogProcess.on('spawn', async () => {
    console.log(`[Blog] ✅ Process spawned (PID: ${blogProcess.pid})`);
    try {
      await waitForPort(BLOG_PORT);
      blogState.ready = true;
      console.log(`[Blog] ✅ Blog LIVE on internal port ${BLOG_PORT}`);
    } catch (e) {
      console.error('[Blog] ❌ Blog port never became reachable:', e.message);
      blogState.ready = false;
    }
  });

  blogProcess.on('error', (err) => {
    console.error('[Blog] ❌ Spawn error:', err.message);
    blogState.ready = false;
  });

  blogProcess.on('exit', async (code, signal) => {
    console.warn(`[Blog] Exited (code=${code}, signal=${signal}).`);
    // IMMEDIATELY check if port is still alive (held by sibling instance).
    // Do NOT set blogState.ready = false until we confirm port is truly dead.
    const sibling = await isPortInUse(BLOG_PORT);
    if (sibling) {
      // Another instance's blog is running on this port — we're fine!
      console.log(`[Blog] ✅ Port ${BLOG_PORT} still held by sibling. Keeping ready.`);
      blogState.ready = true;
      return; // Do NOT restart — sibling handles it
    }
    // Port is genuinely dead — now mark not ready and restart
    blogState.ready = false;
    console.log(`[Blog] Port gone. Restarting in 5s...`);
    setTimeout(launchBlogStandalone, 5000);
  });
};

launchBlogStandalone();
// ─────────────────────────────────────────────────────────────────────────────

// Import the Express API server (must come after blog launcher is set up)
import './server/index.js';

// Sanity check
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('[Critical] dist/ folder not found! Run "npm run build" before deploying.');
} else {
  console.log('[Success] dist/ folder present.');
}
