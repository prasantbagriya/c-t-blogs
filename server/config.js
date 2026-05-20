import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// C-6 FIX: Auto-generate a strong secret if not configured
function getSecret() {
  const secret = process.env.JWT_SECRET || 'wa_saas_secret_2026_fallback';
  return secret.replace(/['"]/g, '').trim();
}

export const JWT_SECRET = getSecret();
export const PORT = process.env.PORT || 3001;
export const META_APP_ID = process.env.META_APP_ID;
export const META_APP_SECRET = process.env.META_APP_SECRET;
export const META_API_VERSION = process.env.META_API_VERSION || 'v20.0';
export const META_CONFIG_ID = process.env.META_CONFIG_ID;
export const THREADS_APP_ID = (process.env.THREADS_APP_ID || '1446328740270537').replace(/['"]/g, '').trim();
export const THREADS_APP_SECRET = (process.env.THREADS_APP_SECRET || '').replace(/['"]/g, '').trim();
export const THREADS_API_VERSION = 'v1.0';
export const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

console.log(`[Config] PORT: ${PORT}`);
console.log(`[Config] JWT_SECRET Length: ${JWT_SECRET.length}`);
console.log(`[Config] META_APP_ID: ${META_APP_ID ? 'Loaded' : 'MISSING'}`);
console.log(`[Config] META_CONFIG_ID: ${META_CONFIG_ID ? 'Loaded' : 'MISSING'}`);
