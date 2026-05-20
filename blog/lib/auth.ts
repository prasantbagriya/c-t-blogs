import { cookies } from 'next/headers';

// ✅ Ensure activeSessions is shared globally across Next.js split bundles
const globalForAuth = global as unknown as {
  activeSessions: Map<string, number>;
};

export const activeSessions = globalForAuth.activeSessions || new Map<string, number>();
globalForAuth.activeSessions = activeSessions;

export const SESSION_TTL = 60 * 60 * 24 * 7 * 1000; // 7 days in ms


// ✅ Prune expired sessions
export function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, expiry] of activeSessions.entries()) {
    if (now > expiry) activeSessions.delete(token);
  }
}

// ✅ Validate session token
export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  if (token.length < 32) return false; // Block guessable / short values
  const expiry = activeSessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

// ✅ Centralized Admin Auth verification for both Server Actions & APIs
export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!isValidSession(token)) {
    throw new Error('Unauthorized: Valid admin session required.');
  }
}
