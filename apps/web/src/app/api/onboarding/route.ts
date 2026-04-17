import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

type OnboardingState = Record<string, unknown>;

/**
 * GET /api/onboarding — returns the current user's onboarding_state.
 * Returns an empty object when nothing has been persisted yet.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`onboarding:get:${userId}`, RATE_LIMITS.read);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({ onboardingState: users.onboardingState })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ onboardingState: row.onboardingState ?? {} });
  } catch (err) {
    console.error('[onboarding GET] error', err);
    return NextResponse.json({ error: 'Failed to read onboarding state' }, { status: 500 });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep merge for the onboarding state. Objects are merged recursively;
 * all other values (including arrays and nulls) overwrite.
 */
function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = out[key];
    if (isPlainObject(pv) && isPlainObject(bv)) {
      out[key] = deepMerge(bv, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

/**
 * PATCH /api/onboarding — merges a partial update into the user's
 * onboarding_state. Body: an arbitrary JSON object. Returns the merged state.
 */
export async function PATCH(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`onboarding:patch:${userId}`, RATE_LIMITS.members);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  let patch: unknown;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isPlainObject(patch)) {
    return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 });
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({ onboardingState: users.onboardingState })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const current = (row.onboardingState as OnboardingState | null) ?? {};
    const merged = deepMerge(current, patch);

    await db.update(users).set({ onboardingState: merged }).where(eq(users.id, userId));

    return NextResponse.json({ onboardingState: merged });
  } catch (err) {
    console.error('[onboarding PATCH] error', err);
    return NextResponse.json({ error: 'Failed to update onboarding state' }, { status: 500 });
  }
}
