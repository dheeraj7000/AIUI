import { NextRequest, NextResponse } from 'next/server';
import { createDb, searchPacks, searchPacksSchema } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * GET /api/registry/search — search the style pack marketplace.
 * No auth required (public marketplace).
 */
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = searchPacksSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const { results, total } = await searchPacks(db, parsed.data);

    return NextResponse.json(
      {
        results,
        total,
        page: Math.floor(parsed.data.offset / parsed.data.limit) + 1,
        pageSize: parsed.data.limit,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('Failed to search packs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
