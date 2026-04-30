/**
 * Centralized validation schema exports.
 */

// Common utilities
export {
  uuidSchema,
  paginationSchema,
  sortSchema,
  slugSchema,
  sanitizeString,
  sanitizedString,
} from './common';
export type { PaginationInput } from './common';

// Style tokens
export {
  createTokenSchema,
  updateTokenSchema,
  bulkImportSchema,
  listTokensSchema,
} from './style-token';
export type {
  CreateTokenInput,
  UpdateTokenInput,
  BulkImportInput,
  ListTokensInput,
} from './style-token';

// Design profile
export { createProfileSchema, updateProfileSchema, listProfilesSchema } from './design-profile';
export type { CreateProfileInput, UpdateProfileInput, ListProfilesInput } from './design-profile';

// Asset validation
export {
  ASSET_TYPE_CONFIG,
  validateAssetUpload,
  getAssetTypeConfig,
  formatSizeLimit,
  isValidAssetType,
} from './asset-validation';

// Accessibility rules
export { DEFAULT_A11Y_RULES, getDefaultA11yRules } from './accessibility';
export type { A11yRule } from './accessibility';
