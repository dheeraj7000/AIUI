import { NextRequest, NextResponse } from 'next/server';
import { createDb, serializePackForRegistry } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/registry/[slug].json
 * Returns the full RegistryItem for a style pack, including tokens and component slugs.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const db = getDb();
    const item = await serializePackForRegistry(db, slug);

    if (!item) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    const etag = `"${item.slug}-${item.version}-${item.tokenCount}"`;

    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        ETag: etag,
      },
    });
  } catch (error) {
    console.error('Failed to get registry pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
