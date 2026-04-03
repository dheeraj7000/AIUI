import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  assignTagSchema,
  assignTag,
  removeTagAssignment,
  TagConflictError,
} from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * POST /api/tags/assign — Assign a tag to a resource.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = assignTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { tagId, resourceId, resourceType } = parsed.data;
    const db = getDb();
    const assignment = await assignTag(db, tagId, resourceId, resourceType);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof TagConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Failed to assign tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tags/assign — Remove a tag assignment from a resource.
 * Expects body: { tagId, resourceId, resourceType }
 */
export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = assignTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { tagId, resourceId, resourceType } = parsed.data;
    const db = getDb();
    const removed = await removeTagAssignment(db, tagId, resourceId, resourceType);

    if (!removed) {
      return NextResponse.json({ error: 'Tag assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove tag assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
