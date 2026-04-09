import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createStylePack,
  bulkImportTokens,
  parseFigmaUrl,
  extractFigmaTokens,
  verifyOrgMembership,
} from '@aiui/design-core';
import { assignStylePack } from '@aiui/design-core/src/operations/project-style-pack';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

/**
 * POST /api/imports/figma — Import design tokens from a Figma file.
 *
 * Parses the Figma URL, extracts tokens via the Figma API, creates a style
 * pack, and bulk-imports the tokens. Optionally assigns the pack to a project.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { fileUrl, accessToken, name, projectId, organizationId } = body as {
      fileUrl: string;
      accessToken: string;
      name?: string;
      projectId?: string;
      organizationId: string;
    };

    if (!fileUrl || !accessToken) {
      return NextResponse.json({ error: 'fileUrl and accessToken are required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const fileKey = parseFigmaUrl(fileUrl);
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Invalid Figma URL. Expected format: https://www.figma.com/file/<key>/...' },
        { status: 400 }
      );
    }

    const result = await extractFigmaTokens(fileKey, accessToken);

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stylePack = await createStylePack(
      db,
      {
        name: name || result.fileName,
        category: 'imported',
      },
      organizationId
    );

    await bulkImportTokens(db, stylePack.id, result.tokens);

    if (projectId) {
      try {
        await assignStylePack(db, projectId, stylePack.id);
      } catch {
        // Project assignment is best-effort; the pack was still created
      }
    }

    return NextResponse.json(
      { stylePack, stats: result.stats, warnings: result.warnings },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to import from Figma:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
