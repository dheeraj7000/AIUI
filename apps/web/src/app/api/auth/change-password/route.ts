import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { verifyToken, createToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';
import { checkRateLimit } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

const PASSWORD_MIN_LENGTH = 8;

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

/**
 * POST /api/auth/change-password — Change the current user's password.
 * Requires the current password to verify identity. Issues fresh tokens
 * after a successful change so the old session stays valid.
 *
 * Body: { currentPassword: string, newPassword: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate via cookie
    const token = req.cookies.get('aiui-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user id
    const rateLimited = checkRateLimit(`change-password:${claims.sub}`);
    if (rateLimited) {
      return NextResponse.json(
        { error: rateLimited.error },
        { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both currentPassword and newPassword are required' },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, claims.sub)).limit(1);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Google-only users have no password to change. Allow them to *set* one
    // by leaving currentPassword blank — but for this endpoint require it.
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            'This account uses Google sign-in and has no password. Set one via "Forgot password" if you want to add password sign-in.',
        },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from the current password' },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Issue fresh tokens after the change so old captured tokens become a
    // weaker attack vector even if not technically invalidated.
    const { accessToken, idToken } = await createToken(user.id, user.email);
    const response = NextResponse.json({ success: true });
    setAuthCookies(response, accessToken, idToken);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
