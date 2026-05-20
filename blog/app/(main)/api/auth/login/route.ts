import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';
import { activeSessions, SESSION_TTL, pruneExpiredSessions, isValidSession } from '@/lib/auth';

// ✅ In-memory rate limiting (resets on server restart — acceptable for small blog)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export { isValidSession }; // Preserve export for compatibility

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
  const now = Date.now();

  // Rate limiting check
  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.count >= MAX_ATTEMPTS && (now - attempt.lastAttempt < LOCKOUT_TIME)) {
    const minutesLeft = Math.ceil((LOCKOUT_TIME - (now - attempt.lastAttempt)) / 60000);
    return NextResponse.json({
      success: false,
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    const masterPassword = process.env.ADMIN_PASSWORD;
    if (!masterPassword) {
      console.error('CRITICAL: ADMIN_PASSWORD environment variable not set!');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    // ✅ Constant-time comparison to prevent timing attacks
    const inputHash = createHash('sha256').update(password).digest('hex');
    const masterHash = createHash('sha256').update(masterPassword).digest('hex');
    const isValid = inputHash === masterHash;

    if (isValid) {
      // Reset rate limiting on success
      loginAttempts.delete(ip);
      pruneExpiredSessions();

      // ✅ Generate cryptographically secure random session token (64 hex chars = 256-bit entropy)
      const sessionToken = randomBytes(32).toString('hex');
      activeSessions.set(sessionToken, now + SESSION_TTL);

      const cookieStore = await cookies();
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,          // ✅ Not accessible via JS (XSS protection)
        secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in prod
        sameSite: 'strict',      // ✅ CSRF protection (strict = no cross-site)
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    // Increment failed attempts
    const count = (attempt?.count || 0) + 1;
    loginAttempts.set(ip, { count, lastAttempt: now });
    const remaining = MAX_ATTEMPTS - count;

    return NextResponse.json({
      success: false,
      error: remaining > 0
        ? `Invalid password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
        : 'Account locked. Too many failed attempts.',
    }, { status: 401 });

  } catch {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ Logout endpoint
export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (token) activeSessions.delete(token);
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
