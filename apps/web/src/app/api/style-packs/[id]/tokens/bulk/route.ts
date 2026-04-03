import { NextRequest, NextResponse } from 'next/server';
import { createDb, bulkImportTokens, bulkImportSchema } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/style-packs/[id]/tokens/bulk — Bulk import tokens.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId } = await context.params;
    const body = await req.json();

    const parsed = bulkImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await bulkImportTokens(db, stylePackId, parsed.data.tokens);

    if ('error' in result) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Failed to bulk import tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
