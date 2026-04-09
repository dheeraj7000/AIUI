import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  getStylePack,
  updateStylePack,
  deleteStylePack,
  updateStylePackSchema,
  verifyOrgMembership,
} from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/style-packs/[id] — Fetch a single style pack by ID.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const stylePack = await getStylePack(db, id);

    if (!stylePack) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    if (stylePack.organizationId) {
      const isMember = await verifyOrgMembership(db, userId, stylePack.organizationId);
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(stylePack);
  } catch (error) {
    console.error('Failed to get style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/style-packs/[id] — Update a style pack.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();

    const existing = await getStylePack(db, id);
    if (!existing) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }
    if (existing.organizationId) {
      const isMember = await verifyOrgMembership(db, userId, existing.organizationId);
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json();

    const parsed = updateStylePackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateStylePack(db, id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/style-packs/[id] — Delete a style pack.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();

    const existing = await getStylePack(db, id);
    if (!existing) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }
    if (existing.organizationId) {
      const isMember = await verifyOrgMembership(db, userId, existing.organizationId);
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const deleted = await deleteStylePack(db, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
