import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import {
  getProfile,
  updateProfile,
  deleteProfile,
} from '@aiui/design-core/src/operations/design-profiles';
import { updateProfileSchema } from '@aiui/design-core/src/validation/design-profile';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/design-profiles/[id]
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const profile = await getProfile(db, id);

    if (!profile) {
      return NextResponse.json({ error: 'Design profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get design profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/design-profiles/[id]
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const updated = await updateProfile(db, id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Design profile not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update design profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/design-profiles/[id]
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const deleted = await deleteProfile(db, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Design profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete design profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
