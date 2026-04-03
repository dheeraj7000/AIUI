import { z } from 'zod';

// --- Core value types ---

export type TokenValue = string | number | boolean;

export const tokenValueSchema = z.union([z.string(), z.number(), z.boolean()]);

// Flat token map: dot-notation keys -> values
export type TokenMap = Record<string, TokenValue>;

export const tokenMapSchema = z.record(z.string(), tokenValueSchema);

// Branded merged token map (post-validation)
export type MergedTokenMap = TokenMap & { readonly __brand: 'MergedTokenMap' };

export const mergedTokenMapSchema = tokenMapSchema.transform((val) => val as MergedTokenMap);

// --- Merge options ---

export interface MergeOptions {
  /** Whether to inject DEFAULT_TOKENS for missing required keys. Defaults to true. */
  applyDefaults?: boolean;
  /** Whether to throw on unknown override keys not present in base. Defaults to false. */
  strict?: boolean;
  /** Maximum $ref resolution depth. Defaults to 3. */
  maxRefDepth?: number;
  /** Whether to coerce string numbers to numeric types. Defaults to true. */
  coerceTypes?: boolean;
}

export const mergeOptionsSchema = z.object({
  applyDefaults: z.boolean().optional(),
  strict: z.boolean().optional(),
  maxRefDepth: z.number().int().min(1).max(10).optional(),
  coerceTypes: z.boolean().optional(),
});

// --- Merge result ---

export interface MergeResult {
  tokens: MergedTokenMap;
  warnings: string[];
}
