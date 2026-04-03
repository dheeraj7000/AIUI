import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/jwt';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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

    // Create JWT tokens
    const { accessToken, idToken, expiresAt } = await createToken(newUser.id, newUser.email);

    return NextResponse.json({
      user: newUser,
      accessToken,
      idToken,
      expiresAt,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
