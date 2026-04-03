import { createHash } from 'crypto';
import { mergeTokens } from './merger';
import { validateTokens } from './validator';
import type { TokenMap, MergeOptions } from './types';
import type { ValidationResult } from './validator';

export interface PromptBundle {
  project: string;
  framework: string;
  stylePack: string;
  tokens: Record<string, string | number | boolean>;
  allowedComponents: string[];
  assets: Record<string, string>;
  rules: string[];
  meta: {
    generatedAt: string;
    version: number;
    checksum: string;
  };
}

export interface BundleInput {
  projectName: string;
  projectSlug: string;
  framework: string;
  stylePackId: string;
  baseTokens: TokenMap;
  overrideTokens: TokenMap;
  selectedComponents: string[];
  assets: Record<string, string>;
  customRules?: string[];
  version?: number;
  mergeOptions?: MergeOptions;
}

export interface BundleSuccess {
  success: true;
  bundle: PromptBundle;
}

export interface BundleFailure {
  success: false;
  errors: string[];
  validation?: ValidationResult;
}

export type BundleResult = BundleSuccess | BundleFailure;

const DEFAULT_RULES = [
  'Use only approved components listed in allowedComponents',
  'Do not introduce new font families beyond those in tokens',
  'Follow the token naming convention for all design values',
];

/**
 * Compute a SHA-256 checksum over deterministic JSON serialization.
 */
function computeChecksum(data: Record<string, unknown>): string {
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  return createHash('sha256').update(sorted).digest('hex');
}

/**
 * Generate a prompt bundle from project inputs.
 *
 * Orchestrates token merging, validation, and bundle assembly.
 * Fails fast if token validation returns errors.
 */
export function generateBundle(input: BundleInput): BundleResult {
  // Step 1: Merge tokens
  const mergeResult = mergeTokens(
    input.baseTokens,
    input.overrideTokens,
    input.mergeOptions ?? { applyDefaults: true }
  );

  // Step 2: Validate merged tokens
  const validation = validateTokens(mergeResult.tokens);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.issues.filter((i) => i.severity === 'error').map((i) => i.message),
      validation,
    };
  }

  // Step 3: Assemble rules
  const rules = [...DEFAULT_RULES, ...(input.customRules ?? [])];

  // Step 4: Build bundle body (without meta)
  const body = {
    project: input.projectName,
    framework: input.framework,
    stylePack: input.stylePackId,
    tokens: { ...mergeResult.tokens } as Record<string, string | number | boolean>,
    allowedComponents: input.selectedComponents,
    assets: input.assets,
    rules,
  };

  // Step 5: Compute checksum over the body
  const checksum = computeChecksum(body as unknown as Record<string, unknown>);

  // Step 6: Assemble the full bundle
  const bundle: PromptBundle = {
    ...body,
    meta: {
      generatedAt: new Date().toISOString(),
      version: (input.version ?? 0) + 1,
      checksum,
    },
  };

  return { success: true, bundle };
}
