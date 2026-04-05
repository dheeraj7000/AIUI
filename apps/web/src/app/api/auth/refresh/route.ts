import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { verifyToken, createToken } from '@/lib/jwt';

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
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
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

    return NextResponse.json({ accessToken, idToken, expiresAt });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
