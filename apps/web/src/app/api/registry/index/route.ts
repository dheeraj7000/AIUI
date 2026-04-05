import { NextResponse } from 'next/server';
import { createDb, getRegistryIndex } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * GET /api/registry/index.json
 * Returns metadata for all public style packs (no tokens).
 */
export async function GET() {
  try {
    const db = getDb();
    const index = await getRegistryIndex(db);

    return NextResponse.json(index, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Failed to get registry index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
