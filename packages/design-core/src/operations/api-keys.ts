import { eq, and, isNull } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { apiKeys } from '../db/schema';
import type { Database } from '../db';

// ---------------------------------------------------------------------------
// Key generation
// ---------------------------------------------------------------------------

function generateRawKey(): string {
  return 'aiui_k_' + randomBytes(24).toString('base64url');
}

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function extractPrefix(raw: string): string {
  return raw.slice(0, 16);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export interface CreateApiKeyInput {
  userId: string;
  organizationId: string;
  projectId?: string | null;
  name: string;
  scopes?: string[];
  expiresAt?: Date | null;
}

export interface ApiKeyWithRaw {
  id: string;
  rawKey: string;
  keyPrefix: string;
  name: string;
  scopes: unknown;
  createdAt: Date;
}

/**
 * Create a new API key. Returns the raw key (shown once to the user).
 */
export async function createApiKey(db: Database, input: CreateApiKeyInput): Promise<ApiKeyWithRaw> {
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = extractPrefix(rawKey);

  const [row] = await db
    .insert(apiKeys)
    .values({
      userId: input.userId,
      organizationId: input.organizationId,
      projectId: input.projectId ?? null,
      name: input.name,
      keyHash,
      keyPrefix,
      scopes: input.scopes ?? ['mcp:read', 'mcp:write'],
      expiresAt: input.expiresAt ?? null,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt,
    });

  return { ...row, rawKey, keyPrefix };
}

/**
 * List active (non-revoked) API keys for a user.
 */
export async function listApiKeys(db: Database, userId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      projectId: apiKeys.projectId,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .orderBy(apiKeys.createdAt);
}

/**
 * Revoke an API key.
 */
export async function revokeApiKey(db: Database, keyId: string, userId: string): Promise<boolean> {
  const [updated] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id });

  return !!updated;
}

/**
 * Verify an API key. Returns the key context if valid, null otherwise.
 * Also updates lastUsedAt.
 */
export interface ApiKeyContext {
  keyId: string;
  userId: string;
  organizationId: string;
  projectId: string | null;
  scopes: string[];
}

export async function verifyApiKey(db: Database, rawKey: string): Promise<ApiKeyContext | null> {
  const keyHash = hashKey(rawKey);

  const [key] = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      organizationId: apiKeys.organizationId,
      projectId: apiKeys.projectId,
      scopes: apiKeys.scopes,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!key) return null;
  if (key.revokedAt) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;

  // Update lastUsedAt in the background — log errors instead of swallowing them
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch((err) => {
      console.error(`Failed to update lastUsedAt for API key ${key.id}:`, err);
    });

  return {
    keyId: key.id,
    userId: key.userId,
    organizationId: key.organizationId,
    projectId: key.projectId,
    scopes: (key.scopes as string[]) ?? [],
  };
}
