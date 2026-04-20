import { NextRequest, NextResponse } from 'next/server';
import { createDb, getOrganization, verifyOrgMembership } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

type RouteContext = { params: Promise<{ orgId: string }> };

/**
 * GET /api/organizations/[orgId] — Return workspace metadata for display.
 *
 * Multi-tenant organization CRUD was removed in the scope-reduction cleanup.
 * Each user now has exactly one personal workspace (auto-provisioned on
 * signup). Only this read endpoint remains, and only for the owning user.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await context.params;

  try {
    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const org = await getOrganization(db, orgId);
    if (!org) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error) {
    console.error('Failed to get workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
