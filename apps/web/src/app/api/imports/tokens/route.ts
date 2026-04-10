import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createStylePack,
  bulkImportTokens,
  parseTokens,
  verifyOrgMembership,
  designProfiles,
} from '@aiui/design-core';
import { assignStylePack } from '@aiui/design-core/src/operations/project-style-pack';
import { eq } from 'drizzle-orm';

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
    const isMember = await verifyOrgMembership(db, userId, organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
        // Mark the project's design profile as stale so MCP read tools
        // surface a warning until sync_design_memory is called. Soft
        // signal — log and continue on failure.
        try {
          await db
            .update(designProfiles)
            .set({ compilationValid: false, updatedAt: new Date() })
            .where(eq(designProfiles.projectId, projectId));
        } catch (staleErr) {
          console.error('Failed to mark design profile stale:', staleErr);
        }
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
