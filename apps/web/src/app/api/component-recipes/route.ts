import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createRecipe,
  listRecipes,
  createRecipeSchema,
  listRecipesSchema,
  verifyOrgMembership,
} from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * GET /api/component-recipes — List component recipes with filtering and pagination.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json(
      { error: 'organizationId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const params = {
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
      offset: req.nextUrl.searchParams.get('offset') ?? undefined,
      type: req.nextUrl.searchParams.get('type') ?? undefined,
      stylePackId: req.nextUrl.searchParams.get('stylePackId') ?? undefined,
      search: req.nextUrl.searchParams.get('search') ?? undefined,
    };

    const parsed = listRecipesSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await listRecipes(db, orgId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list component recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/component-recipes — Create a new component recipe.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const organizationId = body.organizationId as string | undefined;
    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const parsed = createRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const recipe = await createRecipe(db, parsed.data, organizationId);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Failed to create component recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
