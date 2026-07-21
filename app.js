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
import dotenv from 'dotenv';
import { blogState } from './blog-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'blog', '.env.local'), override: true });

console.log('[Entry] Initializing ChatWizs Single-Unit Deployment...');

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception in app.js:', err);
  // Keep alive to prevent 503
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection in app.js at:', promise, 'reason:', reason);
  // Keep alive to prevent 503
});

// ─── CHILD PROCESS CLEANUP ─────────────────────────────────────────────────────
const _childProcesses = [];
['SIGINT', 'SIGTERM', 'exit'].forEach((signal) => {
  process.on(signal, () => {
    _childProcesses.forEach((p) => {
      try { p.kill('SIGTERM'); } catch(e) {}
    });
  });
});

// ─── BLOG STANDALONE LAUNCHER ────────────────────────────────────────────────
const BLOG_PORT = blogState.port;
const blogStandaloneDir    = path.join(__dirname, 'blog', '.next', 'standalone');
const blogStandaloneServer = path.join(blogStandaloneDir, 'server.js');

let blogRestartCount = 0;
let lastBlogRestartTime = 0;
const MAX_RESTARTS = 3;
const RESTART_COOLDOWN = 60000; // 1 minute

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
    console.warn('[Blog] ⚠️ Standalone server.js not found at:', blogStandaloneServer);
    console.warn('[Blog] Blog routes (/blog) will fallback gracefully.');
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

  const now = Date.now();
  if (now - lastBlogRestartTime < 10000) {
    blogRestartCount++;
  } else {
    if (now - lastBlogRestartTime > RESTART_COOLDOWN) {
      blogRestartCount = 0;
    } else {
      blogRestartCount++;
    }
  }
  lastBlogRestartTime = now;

  if (blogRestartCount >= MAX_RESTARTS) {
    console.error(`[Blog] ❌ Blog crashed ${blogRestartCount} times rapidly. Auto-restart disabled to protect server.`);
    blogState.ready = false;
    return;
  }

  console.log(`[Blog] Launching Next.js standalone on internal port ${BLOG_PORT} (Attempt ${blogRestartCount + 1})...`);
  console.log('[Blog] Using node binary:', process.execPath);

  // CRITICAL FIX: Pass absolute paths for data/ and public/uploads/
  // so the standalone blog always reads/writes to the SAME location
  // regardless of its cwd (blog/.next/standalone/).
  // Without this, posts added locally won't appear after deploy.
  const blogDataDir = path.join(__dirname, 'blog', 'data');
  const blogUploadsDir = path.join(__dirname, 'blog', 'public', 'uploads');

  // CRITICAL FIX: Next.js standalone server looks for static files and images in its own cwd/public.
  // We must create a junction/symlink from .next/standalone/public/uploads to the persistent blogUploadsDir.
  const standalonePublicDir = path.join(blogStandaloneDir, 'public');
  const standaloneUploadsDir = path.join(standalonePublicDir, 'uploads');

  try {
    if (!fs.existsSync(standalonePublicDir)) {
      fs.mkdirSync(standalonePublicDir, { recursive: true });
    }
    // If it exists but is not a symlink, or it's a broken symlink, remove it
    if (fs.existsSync(standaloneUploadsDir) || fs.lstatSync(standaloneUploadsDir).isSymbolicLink()) {
      fs.rmSync(standaloneUploadsDir, { recursive: true, force: true });
    }
    // Create directory junction (works on Windows without admin, and Linux)
    fs.symlinkSync(blogUploadsDir, standaloneUploadsDir, 'junction');
    console.log(`[Blog] ✅ Created symlink for uploads: ${standaloneUploadsDir} -> ${blogUploadsDir}`);
  } catch (err) {
    console.error(`[Blog] ⚠️ Failed to create uploads symlink:`, err.message);
  }

  const blogProcess = spawn(process.execPath, [blogStandaloneServer], {
    cwd: blogStandaloneDir,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: blogState.port.toString(),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      // Override data/uploads paths to use blog root (not standalone copy)
      BLOG_DATA_DIR: blogDataDir,
      BLOG_UPLOADS_DIR: blogUploadsDir,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
    },
  });
  _childProcesses.push(blogProcess);

  blogProcess.stdout.on('data', (data) => {
    console.log(`[Blog STDOUT] ${data.toString().trim()}`);
  });

  blogProcess.stderr.on('data', (data) => {
    console.error(`[Blog STDERR] ${data.toString().trim()}`);
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

// Monitor blog port health periodically (fixes sibling process deadlocks under Passenger)
setInterval(async () => {
  const active = await isPortInUse(BLOG_PORT);
  if (!active) {
    if (blogState.ready) {
      console.warn(`[Blog Monitor] Port ${BLOG_PORT} went offline. Attempting self-healing restart...`);
      blogState.ready = false;
      launchBlogStandalone();
    }
  } else {
    blogState.ready = true;
  }
}, 15000);
// ─────────────────────────────────────────────────────────────────────────────

// ─── STUDIO SERVER LAUNCHER ──────────────────────────────────────────────────
const STUDIO_PORT = 5000;
const studioAppPath = path.join(__dirname, 'PB-Creative-Studio', 'server', 'app.js');

let studioRestartCount = 0;
let lastStudioRestartTime = 0;
const MAX_STUDIO_RESTARTS = 3;

const launchStudioServer = async () => {
  if (!fs.existsSync(studioAppPath)) {
    console.warn('[Studio] ⚠️ Studio app.js not found at:', studioAppPath);
    return;
  }

  const alreadyRunning = await isPortInUse(STUDIO_PORT);
  if (alreadyRunning) {
    console.log(`[Studio] ✅ Port ${STUDIO_PORT} already in use. Reusing existing studio server.`);
    return;
  }

  const now = Date.now();
  if (now - lastStudioRestartTime < 10000) {
    studioRestartCount++;
  } else {
    if (now - lastStudioRestartTime > RESTART_COOLDOWN) {
      studioRestartCount = 0;
    } else {
      studioRestartCount++;
    }
  }
  lastStudioRestartTime = now;

  if (studioRestartCount >= MAX_STUDIO_RESTARTS) {
    console.error(`[Studio] ❌ Studio crashed ${studioRestartCount} times rapidly. Auto-restart disabled.`);
    return;
  }

  console.log(`[Studio] Launching PB-Creative-Studio on internal port ${STUDIO_PORT}...`);

  const studioProcess = spawn(process.execPath, [studioAppPath], {
    cwd: path.dirname(studioAppPath),
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: String(STUDIO_PORT),
      NODE_ENV: 'production',
      JWT_SECRET: process.env.JWT_SECRET || 'pb_studio_secret_2026',
    },
  });
  _childProcesses.push(studioProcess);

  studioProcess.stdout.on('data', (data) => {
    console.log(`[Studio STDOUT] ${data.toString().trim()}`);
  });

  studioProcess.stderr.on('data', (data) => {
    console.error(`[Studio STDERR] ${data.toString().trim()}`);
  });

  studioProcess.on('spawn', async () => {
    console.log(`[Studio] ✅ Process spawned (PID: ${studioProcess.pid})`);
    try {
      await waitForPort(STUDIO_PORT);
      console.log(`[Studio] ✅ Studio LIVE on internal port ${STUDIO_PORT}`);
    } catch (e) {
      console.error('[Studio] ❌ Studio port never became reachable:', e.message);
    }
  });

  studioProcess.on('error', (err) => {
    console.error('[Studio] ❌ Spawn error:', err.message);
  });

  studioProcess.on('exit', async (code, signal) => {
    console.warn(`[Studio] Exited (code=${code}, signal=${signal}).`);
    const sibling = await isPortInUse(STUDIO_PORT);
    if (sibling) {
      console.log(`[Studio] ✅ Port ${STUDIO_PORT} still held by sibling.`);
      return;
    }
    console.log(`[Studio] Port gone. Restarting in 5s...`);
    setTimeout(launchStudioServer, 5000);
  });
};

launchStudioServer();
// ─────────────────────────────────────────────────────────────────────────────

// Import the Express API server (must come after blog launcher is set up)
const serverModule = await import('./server/index.js');
export const app = serverModule.app;

// Sanity check
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('[Critical] dist/ folder not found! Run "npm run build" before deploying.');
} else {
  console.log('[Success] dist/ folder present.');
}
