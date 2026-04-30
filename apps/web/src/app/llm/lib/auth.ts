import { NextRequest } from 'next/server';
import { createDb, verifyApiKey, projects, styleTokens } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import type { Database } from '@aiui/design-core';

export interface LlmAuthResult {
  project: typeof projects.$inferSelect;
  tokens: (typeof styleTokens.$inferSelect)[];
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
 * After the scope cut, tokens are project-scoped (no style packs). All LLM
 * routes require a valid `Authorization: Bearer <key>` header.
 *
 * On success returns { project, tokens }.
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

  // 2. Require API key
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authorization required', status: 401 };
  }

  const rawKey = authHeader.slice(7);
  const keyContext = await verifyApiKey(db, rawKey);

  if (!keyContext) {
    return { error: 'Invalid or expired API key', status: 401 };
  }

  // 3. Get project tokens
  const tokens = await db.select().from(styleTokens).where(eq(styleTokens.projectId, project.id));

  return { project, tokens };
}

/**
 * Type guard to distinguish auth errors from successful results.
 */
export function isAuthError(result: LlmAuthResult | LlmAuthError): result is LlmAuthError {
  return 'error' in result && 'status' in result;
}
