import { NextRequest, NextResponse } from 'next/server';
import { createDb, revokeApiKey } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/api-keys/[id] — Revoke an API key.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  try {
    const db = getDb();
    const revoked = await revokeApiKey(db, id, userId);
    if (!revoked) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
