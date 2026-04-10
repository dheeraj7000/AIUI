import { NextRequest, NextResponse } from 'next/server';
import {
  updateComponentSelection,
  getComponentSelection,
  InvalidComponentIdsError,
} from '@aiui/design-core/src/operations/project-components';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

const updateSelectionSchema = z.object({
  componentRecipeIds: z.array(z.string().uuid()).max(500),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/components — List selected component recipes.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const selection = await getComponentSelection(access.db, id);
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
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = updateSelectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const selection = await updateComponentSelection(access.db, id, parsed.data.componentRecipeIds);

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
