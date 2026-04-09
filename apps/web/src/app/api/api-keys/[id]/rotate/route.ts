import { NextRequest, NextResponse } from 'next/server';
import { createDb, rotateApiKey } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/api-keys/[id]/rotate — Rotate an API key.
 * Creates a new key with the same scopes/org/project, revokes the old one.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const result = await rotateApiKey(db, id, userId);

    if (!result) {
      return NextResponse.json({ error: 'API key not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to rotate API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
