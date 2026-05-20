import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import our server logic from server/index.js
// We use the same app instance or just let index.js handle it
// To satisfy deployment platforms, we'll make app.js the primary entry point

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Entry] Initializing ChatWizs Single-Unit Deployment...');

// Import the actual server (this starts the DB and routes)
import './server/index.js';

// The server/index.js already handles app.listen and static serving.
// However, some platforms need app.js to be the one that handles the "Root".
// If your deployment is still failing, it's likely because the 'dist' folder 
// was not uploaded or built. 

// We'll add a final sanity check here to ensure the dist is recognized
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('[Critical] dist folder not found! Make sure you run "npm run build" before deploying.');
} else {
  console.log('[Success] dist folder recognized at:', distPath);
}
