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

const launchBlogStandalone = () => {
  if (!fs.existsSync(blogStandaloneServer)) {
    console.warn('[Blog] ⚠️  Standalone server.js not found at:', blogStandaloneServer);
    console.warn('[Blog] Blog routes (/blog) will return 503.');
    return;
  }

  console.log(`[Blog] Launching Next.js standalone on internal port ${BLOG_PORT}...`);

  const blogProcess = spawn('node', [blogStandaloneServer], {
    cwd: blogStandaloneDir,
    shell: false,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(BLOG_PORT),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
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

  blogProcess.on('exit', (code, signal) => {
    blogState.ready = false;
    console.warn(`[Blog] Exited (code=${code}, signal=${signal}). Restarting in 5s...`);
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
