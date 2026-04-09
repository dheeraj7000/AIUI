import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { setAuthCookies } from '@/lib/auth-cookies';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Rate limit by email (5 attempts per minute)
    const rateLimited = checkRateLimit(`signin:${email.toLowerCase()}`);
    if (rateLimited) {
      return NextResponse.json(
        { error: rateLimited.error },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimited.retryAfter) },
        }
      );
    }

    const db = getDb();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { accessToken, idToken, expiresAt } = await createToken(user.id, user.email);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      idToken,
      expiresAt,
    });

    // Set HttpOnly cookies so the middleware can read tokens server-side
    // while preventing client-side JS access (XSS mitigation).
    setAuthCookies(response, accessToken, idToken);

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
