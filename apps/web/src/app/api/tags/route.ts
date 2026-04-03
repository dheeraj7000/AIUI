import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createTagSchema,
  listTagsSchema,
  createTag,
  listTags,
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
 * GET /api/tags — List tags with optional category/search filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = listTagsSchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await listTags(db, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tags — Create a new tag.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const tag = await createTag(db, parsed.data.name, parsed.data.category);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof TagConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
