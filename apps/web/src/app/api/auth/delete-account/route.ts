import { NextRequest, NextResponse } from 'next/server';
import { createDb, users, organizationMembers, organizations } from '@aiui/design-core';
import { eq, and, ne, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/jwt';
import { clearAuthCookies } from '@/lib/auth-cookies';
import { checkRateLimit } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

const CONFIRM_PHRASE = 'DELETE my account';

/**
 * POST /api/auth/delete-account — Permanently delete the current user.
 *
 * Identity verification:
 * - Password users: must provide their current `password` in the body
 * - Google-only users (no passwordHash): must type the exact phrase
 *   "DELETE my account" in the `confirmPhrase` field
 *
 * Cleanup:
 * - Any organisation where this user is the *sole* owner is deleted
 *   (cascades to projects, style packs, components, api keys, etc.)
 * - Organisations they share with other owners stay intact
 * - The user row is then deleted, which cascades to organization_members
 *   and api_keys via foreign keys
 * - HttpOnly auth cookies are cleared on the response
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = req.cookies.get('aiui-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit (this is destructive, low cap)
    const rateLimited = checkRateLimit(`delete-account:${claims.sub}`);
    if (rateLimited) {
      return NextResponse.json(
        { error: rateLimited.error },
        { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const password: string | undefined = body.password;
    const confirmPhrase: string | undefined = body.confirmPhrase;

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, claims.sub)).limit(1);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify identity
    if (user.passwordHash) {
      // Password account — require current password
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Password is incorrect' }, { status: 401 });
      }
    } else {
      // Google-only account — require exact confirmation phrase
      if (confirmPhrase !== CONFIRM_PHRASE) {
        return NextResponse.json(
          { error: `Type "${CONFIRM_PHRASE}" exactly to confirm` },
          { status: 400 }
        );
      }
    }

    // Find orgs where the user is a member
    const memberships = await db
      .select({
        orgId: organizationMembers.organizationId,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id));

    // For each org, check if the user is the sole owner; if so, delete the org
    const orgsToDelete: string[] = [];
    for (const m of memberships) {
      if (m.role !== 'owner') continue;
      const [{ otherOwners }] = await db
        .select({ otherOwners: count() })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, m.orgId),
            eq(organizationMembers.role, 'owner'),
            ne(organizationMembers.userId, user.id)
          )
        );
      if (otherOwners === 0) {
        orgsToDelete.push(m.orgId);
      }
    }

    // Delete sole-owner orgs (cascades to projects, style packs, etc.)
    for (const orgId of orgsToDelete) {
      await db.delete(organizations).where(eq(organizations.id, orgId));
    }

    // Delete the user (cascades to remaining org_members + api_keys)
    await db.delete(users).where(eq(users.id, user.id));

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      orgsDeleted: orgsToDelete.length,
    });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
