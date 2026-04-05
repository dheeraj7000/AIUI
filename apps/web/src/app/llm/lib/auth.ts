import { NextRequest } from 'next/server';
import {
  createDb,
  verifyApiKey,
  projects,
  stylePacks,
  styleTokens,
  componentRecipes,
} from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import type { Database } from '@aiui/design-core';

export interface LlmAuthResult {
  project: typeof projects.$inferSelect;
  stylePack: typeof stylePacks.$inferSelect;
  tokens: (typeof styleTokens.$inferSelect)[];
  components: (typeof componentRecipes.$inferSelect)[];
}

export interface LlmAuthError {
  error: string;
  status: number;
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return createDb(url);
}

export { getDb };

/**
 * Authenticate and load all data needed by LLM documentation routes.
 *
 * - If the project's active style pack is public, no auth is required.
 * - If private, a valid `Authorization: Bearer <key>` header is required.
 *
 * On success returns { project, stylePack, tokens, components }.
 * On failure returns { error, status }.
 */
export async function authenticateLlmRequest(
  req: NextRequest,
  db: Database,
  projectSlug: string
): Promise<LlmAuthResult | LlmAuthError> {
  // 1. Get project by slug
  const [project] = await db.select().from(projects).where(eq(projects.slug, projectSlug)).limit(1);

  if (!project) {
    return { error: 'Project not found', status: 404 };
  }

  if (!project.activeStylePackId) {
    return { error: 'Project has no active style pack', status: 404 };
  }

  // 2. Get style pack
  const [pack] = await db
    .select()
    .from(stylePacks)
    .where(eq(stylePacks.id, project.activeStylePackId))
    .limit(1);

  if (!pack) {
    return { error: 'Style pack not found', status: 404 };
  }

  // 3. Check auth — public packs don't require authentication
  if (!pack.isPublic) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Authorization required for private style packs', status: 401 };
    }

    const rawKey = authHeader.slice(7);
    const keyContext = await verifyApiKey(db, rawKey);

    if (!keyContext) {
      return { error: 'Invalid or expired API key', status: 401 };
    }
  }

  // 4. Get tokens
  const tokens = await db.select().from(styleTokens).where(eq(styleTokens.stylePackId, pack.id));

  // 5. Get components
  const components = await db
    .select()
    .from(componentRecipes)
    .where(eq(componentRecipes.stylePackId, pack.id));

  return { project, stylePack: pack, tokens, components };
}

/**
 * Type guard to distinguish auth errors from successful results.
 */
export function isAuthError(result: LlmAuthResult | LlmAuthError): result is LlmAuthError {
  return 'error' in result && 'status' in result;
}
