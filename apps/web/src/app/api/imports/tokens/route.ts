import { NextRequest, NextResponse } from 'next/server';
import { createDb, createStylePack, bulkImportTokens, parseTokens } from '@aiui/design-core';
import { assignStylePack } from '@aiui/design-core/src/operations/project-style-pack';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

/**
 * POST /api/imports/tokens — Import tokens from CSS variables, Tokens Studio
 * JSON, or Tailwind config content.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { content, format, name, projectId, organizationId } = body as {
      content: string;
      format?: 'css' | 'tokens-studio' | 'tailwind' | 'auto';
      name: string;
      projectId?: string;
      organizationId: string;
    };

    if (!content || !name) {
      return NextResponse.json({ error: 'content and name are required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const result = parseTokens(content, format);

    if (result.tokens.length === 0) {
      return NextResponse.json(
        { error: 'No tokens could be parsed from the provided content' },
        { status: 400 }
      );
    }

    const db = getDb();

    const stylePack = await createStylePack(
      db,
      {
        name,
        category: 'imported',
      },
      organizationId
    );

    await bulkImportTokens(db, stylePack.id, result.tokens);

    if (projectId) {
      try {
        await assignStylePack(db, projectId, stylePack.id);
      } catch {
        // Project assignment is best-effort
      }
    }

    return NextResponse.json(
      { stylePack, stats: result.stats, warnings: result.warnings },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to import tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
