import { createHash } from 'crypto';
import { eq, asc } from 'drizzle-orm';
import { styleTokens } from '../db/schema';
import type { Database } from '../db';

/**
 * Compute a stable hash of a project's tokens.
 * Used to detect drift between the .aiui/design-memory.md on disk and
 * the latest tokens in the database.
 */
export async function computeTokensHash(db: Database, projectId: string): Promise<string> {
  const tokens = await db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenType: styleTokens.tokenType,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, projectId))
    .orderBy(asc(styleTokens.tokenKey));

  const canonical = tokens.map((t) => `${t.tokenType}|${t.tokenKey}|${t.tokenValue}`).join('\n');
  return createHash('sha256').update(canonical).digest('hex');
}
