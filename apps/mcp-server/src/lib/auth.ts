import { verifyApiKey, type ApiKeyContext } from '@aiui/design-core';
import { getDb } from './db';
import { log, ToolError } from './errors';

/**
 * Verify a Bearer token from the Authorization header.
 * Returns the API key context or null if invalid.
 */
export async function authenticateRequest(
  authHeader: string | null
): Promise<ApiKeyContext | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith('aiui_k_')) {
    return null;
  }

  try {
    const db = getDb();
    return await verifyApiKey(db, rawKey);
  } catch (error) {
    log('error', 'API key verification failed', { error: String(error) });
    return null;
  }
}

/**
 * Check that the required scope is present in the provided scopes list.
 * Throws a ToolError if the scope is missing.
 */
export function requireScope(scopes: string[], required: string): void {
  if (!scopes.includes(required)) {
    throw new ToolError(`Insufficient scope: requires '${required}'`, 'FORBIDDEN');
  }
}
