import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  updateRecipeSchema,
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
 * GET /api/component-recipes/[id] — Get a single component recipe with style pack name.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const recipe = await getRecipe(db, id);

    if (!recipe) {
      return NextResponse.json({ error: 'Component recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to get component recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/component-recipes/[id] — Update a component recipe.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = updateRecipeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const updated = await updateRecipe(db, id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Component recipe not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update component recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/component-recipes/[id] — Delete a component recipe.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const db = getDb();
    const deleted = await deleteRecipe(db, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Component recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete component recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
