import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createOrgSchema,
  createOrganization,
  listUserOrganizations,
} from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * GET /api/organizations — List organizations for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const orgs = await listUserOrganizations(db, userId);
    return NextResponse.json(orgs);
  } catch (error) {
    console.error('Failed to list organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/organizations — Create a new organization.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const org = await createOrganization(db, {
      name: parsed.data.name,
      ownerId: userId,
    });

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
