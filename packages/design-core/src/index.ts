// Token types and validation rules
export { TokenCategory, TOKEN_VALIDATION_RULES } from './tokens/token-types';
export type { TokenValidationRule } from './tokens/token-types';

// Token validation
export { validateToken, validateStylePack } from './tokens/token-validator';
export type { ValidationResult } from './tokens/token-validator';

// Token merge utilities
export { mergeTokens, mergeMultiple } from './tokens/token-merger';

// Schemas
export { stylePackInputSchema } from './schemas/style-pack.schema';
export type { StylePackInput } from './schemas/style-pack.schema';

export { designProfileCompositionSchema } from './schemas/design-profile.schema';
export type { DesignProfileComposition } from './schemas/design-profile.schema';

// Token compliance
export { checkTokenCompliance } from './validation/token-compliance';
export type { ComplianceViolation, ComplianceResult } from './validation/token-compliance';

// Drift detection
export { detectDrift } from './validation/drift-detection';
export type { DriftChange, DriftResult } from './validation/drift-detection';

// Asset validation
export {
  ASSET_TYPE_CONFIG,
  validateAssetUpload,
  getAssetTypeConfig,
  formatSizeLimit,
  isValidAssetType,
} from './validation/asset-validation';
export type {
  AssetType,
  AssetTypeConfig,
  AssetUploadParams,
  AssetValidationResult,
} from './validation/asset-validation';

// S3 storage
export {
  createS3Client,
  buildStorageKey,
  generatePresignedUploadUrl,
  deleteObject,
} from './storage/s3';
export type { PresignedUploadParams, PresignedUploadResult } from './storage/s3';

// Database schema and connection
export { createDb } from './db';
export type { Database } from './db';
export * from './db/schema';

// Organization validation
export { createOrgSchema, updateOrgSchema } from './validation/organization';
export type { CreateOrgInput, UpdateOrgInput } from './validation/organization';

// Organization operations
export {
  createOrganization,
  getOrganization,
  listUserOrganizations,
  updateOrganization,
  deleteOrganization,
} from './operations/organizations';

// Style pack validation
export {
  createStylePackSchema as createStylePackValidation,
  updateStylePackSchema,
  listStylePacksSchema,
} from './validation/style-pack';
export type {
  CreateStylePackInput,
  UpdateStylePackInput,
  ListStylePacksInput,
} from './validation/style-pack';

// Style pack operations
export {
  createStylePack,
  getStylePack,
  listStylePacks,
  updateStylePack,
  deleteStylePack,
} from './operations/style-packs';

// Tag validation
export { createTagSchema, assignTagSchema, listTagsSchema } from './validation/tag';
export type { CreateTagInput, AssignTagInput, ListTagsInput } from './validation/tag';

// Tag operations
export {
  createTag,
  getTag,
  listTags,
  deleteTag,
  assignTag,
  removeTagAssignment,
  getTagsForResource,
  getResourcesByTag,
  TagConflictError,
} from './operations/tags';

// Component recipe validation
export {
  createRecipeSchema,
  updateRecipeSchema,
  listRecipesSchema,
} from './validation/component-recipe';
export type {
  CreateRecipeInput,
  UpdateRecipeInput,
  ListRecipesInput,
} from './validation/component-recipe';

// Component recipe operations
export {
  createRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
  deleteRecipe,
} from './operations/component-recipes';

// Style token validation
export {
  createTokenSchema,
  updateTokenSchema,
  bulkImportSchema,
  listTokensSchema,
} from './validation/style-token';
export type {
  CreateTokenInput,
  UpdateTokenInput,
  BulkImportInput,
  ListTokensInput,
} from './validation/style-token';

// Style token operations
export {
  createToken,
  getToken,
  listTokens,
  updateToken,
  deleteToken,
  bulkImportTokens,
  exportTokens,
} from './operations/style-tokens';

// Asset operations
export {
  createAsset,
  getAssetById,
  listAssets,
  deleteAsset,
  updateAssetMetadata,
} from './operations/assets';
export type { CreateAssetInput, ListAssetsParams } from './operations/assets';

// Member validation
export { createInvitationSchema, updateRoleSchema } from './validation/member';
export type { CreateInvitationInput, UpdateRoleInput } from './validation/member';

// Invitation operations
export {
  createInvitation,
  acceptInvitation,
  listPendingInvitations,
  revokeInvitation,
} from './operations/invitations';

// Member operations
export { updateMemberRole, removeMember } from './operations/members';

// Permissions
export {
  canManageMembers,
  canDeleteOrg,
  canUpdateOrg,
  canChangeRole,
  canRemoveMember,
  ROLE_HIERARCHY,
} from './lib/permissions';
export type { OrgRole } from './lib/permissions';

// Metadata extraction
export {
  extractMetadata,
  extractMetadataFromS3,
  extractImageMetadata,
  extractSvgMetadata,
  extractFontMetadata,
} from './storage/metadata';
export type { ImageMetadata, SvgMetadata, FontMetadata, AssetMetadata } from './storage/metadata';

// CDN / CloudFront
export {
  generatePublicUrl,
  getCachePolicy,
  invalidateCache,
  invalidateAndDelete,
  setObjectCacheHeaders,
} from './storage/cdn';
export type { CachePolicy } from './storage/cdn';

// Design profile validation
export {
  createProfileSchema,
  updateProfileSchema,
  listProfilesSchema,
} from './validation/design-profile';
export type {
  CreateProfileInput,
  UpdateProfileInput,
  ListProfilesInput,
} from './validation/design-profile';

// Design profile operations
export {
  createProfile,
  getProfile,
  listProfiles,
  updateProfile,
  deleteProfile,
  compileDesignProfile,
} from './operations/design-profiles';

// Compiler
export { compileProfile, resolveTokens } from './compiler';
export type { CompiledProfile, TokenMap, ResolveResult } from './compiler';

// Project validation
export {
  createProjectSchema as createProjectValidation,
  updateProjectSchema as updateProjectValidation,
  listProjectsSchema,
} from './validation/project';
export type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsInput,
} from './validation/project';

// Project operations
export {
  createProject,
  getProjectById,
  listProjects,
  updateProject,
  deleteProject,
  generateProjectSlug,
} from './operations/projects';

// Project style pack operations
export {
  assignStylePack,
  getProjectStylePack,
  StylePackNotFoundError,
  ProjectNotFoundError,
} from './operations/project-style-pack';
export type { MergedStylePack } from './operations/project-style-pack';

// Project component selection
export {
  updateComponentSelection,
  getComponentSelection,
  InvalidComponentIdsError,
} from './operations/project-components';
export type { ComponentSelectionItem } from './operations/project-components';

// Project asset operations
export { getProjectAssets, getProjectAsset, unlinkProjectAsset } from './operations/project-assets';
export type { ProjectAsset, AssetRole } from './operations/project-assets';

// Project settings
export { getProjectSettings } from './operations/project-settings';
export type {
  ProjectSettings,
  IntegrationStatus,
  LayoutDensity,
} from './operations/project-settings';

// Project context (public)
export { getProjectContext } from './operations/project-context';
export type { ProjectContext } from './operations/project-context';

// Common validation utilities
export {
  uuidSchema,
  paginationSchema,
  sortSchema,
  slugSchema,
  sanitizeString,
  sanitizedString,
} from './validation/common';
export type { PaginationInput } from './validation/common';

// Query helpers
export {
  buildStylePackListQuery,
  buildStylePackByIdQuery,
  buildStylePackBySlugQuery,
  type StylePackListFilters,
} from './db/queries';

// API key operations
export { createApiKey, listApiKeys, revokeApiKey, verifyApiKey } from './operations/api-keys';
export type { CreateApiKeyInput, ApiKeyWithRaw, ApiKeyContext } from './operations/api-keys';

// Design token importers
export {
  detectFormat,
  parseTokens,
  parseFigmaUrl,
  extractFigmaTokens,
  parseCssVariables,
  parseTokensStudio,
  parseTailwindConfig,
} from './importers';
export type { ImportFormat, ImportResult, FigmaExtractionResult } from './importers';
