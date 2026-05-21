import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

export const SESSION_TTL = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

// ✅ No-op for backwards compatibility
export function pruneExpiredSessions() {
}

// ✅ Generate a stateless signed token based on expiry
export function signToken(expiry: number): string {
  const secret = process.env.ADMIN_PASSWORD || 'fallback_secret_key_123';
  const signature = createHmac('sha256', secret).update(expiry.toString()).digest('hex');
  return `${expiry}.${signature}`;
}

// ✅ Validate session token statelessly
export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  
  const expiry = parseInt(parts[0], 10);
  const signature = parts[1];
  
  if (isNaN(expiry) || Date.now() > expiry) return false;
  
  const expectedSignature = signToken(expiry).split('.')[1];
  return signature === expectedSignature;
}

// ✅ Centralized Admin Auth verification for both Server Actions & APIs
export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!isValidSession(token)) {
    throw new Error('Unauthorized: Valid admin session required.');
  }
}
