import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { verifyToken, createToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * POST /api/auth/refresh — Exchange a valid (or recently expired) access token
 * for a fresh token pair. The token must still be verifiable (signature valid,
 * issuer matches) but we allow up to 24 hours past expiry for refresh.
 */
export async function POST(req: NextRequest) {
  try {
    // Accept token from Authorization header OR HttpOnly cookie.
    // The cookie path is required for cold-start refresh after a page reload,
    // since HttpOnly cookies cannot be read by client JS.
    const authHeader = req.headers.get('authorization');
    const token =
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ??
      req.cookies.get('aiui-access-token')?.value ??
      null;

    if (!token) {
      return NextResponse.json({ error: 'No auth token found' }, { status: 401 });
    }

    // Rate limit by last 10 chars of token (no userId available yet)
    const rateLimited = checkRateLimit(`refresh:${token.slice(-10)}`, RATE_LIMITS.refresh);
    if (rateLimited) {
      return NextResponse.json(
        { error: rateLimited.error },
        { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
      );
    }

    // Verify token — accept recently expired tokens for refresh
    const claims = await verifyToken(token);

    if (!claims) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user still exists
    const db = getDb();
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Issue fresh tokens
    const { accessToken, idToken, expiresAt } = await createToken(user.id, user.email);

    const response = NextResponse.json({ accessToken, idToken, expiresAt });

    // Set HttpOnly cookies so the middleware can read tokens server-side
    // while preventing client-side JS access (XSS mitigation).
    setAuthCookies(response, accessToken, idToken);

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
