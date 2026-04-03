import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { createProfile, listProfiles } from '@aiui/design-core/src/operations/design-profiles';
import {
  createProfileSchema,
  listProfilesSchema,
} from '@aiui/design-core/src/validation/design-profile';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

/**
 * POST /api/design-profiles — Create a new design profile.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const profile = await createProfile(db, parsed.data);
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Failed to create design profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/design-profiles?projectId=... — List profiles for a project.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = {
      projectId: req.nextUrl.searchParams.get('projectId') ?? '',
    };
    const parsed = listProfilesSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const profiles = await listProfiles(db, parsed.data.projectId);
    return NextResponse.json({ data: profiles });
  } catch (error) {
    console.error('Failed to list design profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
