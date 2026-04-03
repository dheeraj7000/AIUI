import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import {
  updateComponentSelection,
  getComponentSelection,
  InvalidComponentIdsError,
} from '@aiui/design-core/src/operations/project-components';
import { z } from 'zod';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const updateSelectionSchema = z.object({
  componentRecipeIds: z.array(z.string().uuid()).max(500),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/components — List selected component recipes.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const selection = await getComponentSelection(db, id);
    return NextResponse.json(selection);
  } catch (error) {
    console.error('Failed to get component selection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]/components — Replace component selection.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = updateSelectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const selection = await updateComponentSelection(db, id, parsed.data.componentRecipeIds);

    return NextResponse.json(selection);
  } catch (error) {
    if (error instanceof InvalidComponentIdsError) {
      return NextResponse.json(
        { error: error.message, invalidIds: error.invalidIds },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Failed to update component selection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
