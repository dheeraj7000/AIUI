import { NextRequest, NextResponse } from 'next/server';
import { createDb, createApiKey, listApiKeys } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * POST /api/api-keys — Create a new API key.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, organizationId, projectId } = await req.json();
    if (!name || !organizationId) {
      return NextResponse.json({ error: 'name and organizationId are required' }, { status: 400 });
    }

    const db = getDb();
    const key = await createApiKey(db, { userId, organizationId, projectId, name });

    return NextResponse.json(key, { status: 201 });
  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/api-keys — List the current user's API keys.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const keys = await listApiKeys(db, userId);
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
