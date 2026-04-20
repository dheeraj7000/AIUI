import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { setAuthCookies } from '@/lib/auth-cookies';
import { bootstrapNewUser } from '@/lib/bootstrap-new-user';

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
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Rate limit by email (5 attempts per minute)
    const rateLimited = checkRateLimit(`signup:${email.toLowerCase()}`);
    if (rateLimited) {
      return NextResponse.json(
        { error: rateLimited.error },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimited.retryAfter) },
        }
      );
    }

    // Validate password complexity
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const db = getDb();

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name || email.split('@')[0],
        cognitoSub: `local-${crypto.randomUUID()}`,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    // Provision the user's workspace + seed a starter project so the dashboard
    // has something useful on first load. Failures here don't block signup —
    // the `ensureBootstrap` middleware can retry on the next authed request.
    const bootstrap = await bootstrapNewUser(db, {
      userId: newUser.id,
      displayName: newUser.name ?? email.split('@')[0],
    });

    // Create JWT tokens
    const { accessToken, idToken, expiresAt } = await createToken(newUser.id, newUser.email);

    const response = NextResponse.json({
      user: newUser,
      accessToken,
      idToken,
      expiresAt,
      workspace: { organizationId: bootstrap.organizationId },
      starterProject: bootstrap.projectSlug
        ? { slug: bootstrap.projectSlug, redirectTo: `/projects/${bootstrap.projectSlug}` }
        : null,
    });

    // Set HttpOnly cookies so the middleware can read tokens server-side
    // while preventing client-side JS access (XSS mitigation).
    setAuthCookies(response, accessToken, idToken);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
