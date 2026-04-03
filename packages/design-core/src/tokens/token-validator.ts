import { TokenCategory, TOKEN_VALIDATION_RULES } from './token-types';

/**
 * Result of a token or style pack validation.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TOKEN_TYPES = new Set<string>(Object.values(TokenCategory));

/**
 * Validates a single design token against its type-specific rules.
 *
 * @param tokenKey   - The dot-notated key, e.g. "color.primary"
 * @param tokenValue - The CSS value to validate
 * @param tokenType  - One of the TokenCategory values
 * @returns A ValidationResult with errors and warnings
 */
export function validateToken(
  tokenKey: string,
  tokenValue: string,
  tokenType: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check key is non-empty
  if (!tokenKey || tokenKey.trim().length === 0) {
    errors.push('Token key must not be empty');
  }

  // Check value is non-empty
  if (!tokenValue || tokenValue.trim().length === 0) {
    errors.push('Token value must not be empty');
  }

  // Check token type is recognized
  if (!VALID_TOKEN_TYPES.has(tokenType)) {
    errors.push(
      `Unknown token type "${tokenType}". Must be one of: ${[...VALID_TOKEN_TYPES].join(', ')}`
    );
    return { valid: errors.length === 0, errors, warnings };
  }

  // Type-specific validation
  const rule = TOKEN_VALIDATION_RULES[tokenType as TokenCategory];
  if (tokenValue && tokenValue.trim().length > 0 && !rule.validate(tokenValue)) {
    errors.push(`Invalid value "${tokenValue}" for token type "${tokenType}". ${rule.description}`);
  }

  // Warn if the key prefix doesn't match the token type
  const keyPrefix = tokenKey.split('.')[0];
  if (keyPrefix && keyPrefix !== tokenType) {
    warnings.push(`Token key prefix "${keyPrefix}" does not match token type "${tokenType}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates an array of style pack tokens.
 *
 * @param tokens - Array of token definitions to validate
 * @returns An array of ValidationResult, one per token
 */
export function validateStylePack(
  tokens: Array<{ tokenKey: string; tokenValue: string; tokenType: string }>
): ValidationResult[] {
  return tokens.map((token) => validateToken(token.tokenKey, token.tokenValue, token.tokenType));
}
