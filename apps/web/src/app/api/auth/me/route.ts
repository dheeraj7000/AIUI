import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * GET /api/auth/me — Return the currently authenticated user based on
 * the HttpOnly access token cookie. This is the source of truth for the
 * client on cold start (page refresh) since HttpOnly cookies cannot be
 * read by JavaScript directly.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('aiui-access-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    // Verify user still exists in DB
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        // Tell the client whether this account has a password (vs Google-only).
        // The hash itself is never exposed.
        hasPassword: !!user.passwordHash,
        emailVerified: true,
        sub: user.id,
      },
      session: {
        // Don't expose the actual token to JS — just the expiry
        expiresAt: claims.exp * 1000,
      },
    });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }
}
