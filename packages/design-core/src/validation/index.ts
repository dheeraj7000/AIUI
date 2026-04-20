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

// Style packs
export { createStylePackSchema, updateStylePackSchema, listStylePacksSchema } from './style-pack';
export type { CreateStylePackInput, UpdateStylePackInput, ListStylePacksInput } from './style-pack';

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

// Component recipes
export { createRecipeSchema, updateRecipeSchema, listRecipesSchema } from './component-recipe';
export type { CreateRecipeInput, UpdateRecipeInput, ListRecipesInput } from './component-recipe';

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
