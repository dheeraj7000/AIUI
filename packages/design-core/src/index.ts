// Token types and validation rules
export { TokenCategory, TOKEN_VALIDATION_RULES } from './tokens/token-types';
export type { TokenValidationRule } from './tokens/token-types';

// Token validation
export { validateToken, validateTokens } from './tokens/token-validator';
export type { ValidationResult } from './tokens/token-validator';

// Token merge utilities
export { mergeTokens, mergeMultiple } from './tokens/token-merger';

// Token compliance
export { checkTokenCompliance } from './validation/token-compliance';
export type {
  ComplianceViolationType,
  ComplianceViolation,
  ComplianceResult,
} from './validation/token-compliance';

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

// Database schema and connection
export { createDb } from './db';
export type { Database } from './db';
export * from './db/schema';

// Workspace (personal organization) operations — retained after scope cut
export { getOrganization, getUserWorkspace, ensureUserWorkspace } from './operations/organizations';

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

// Style token operations (project-scoped)
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

// Metadata extraction
export {
  extractMetadata,
  extractImageMetadata,
  extractSvgMetadata,
  extractFontMetadata,
} from './storage/metadata';
export type { ImageMetadata, SvgMetadata, FontMetadata, AssetMetadata } from './storage/metadata';

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
} from './operations/design-profiles';

// Compiler (token-only after scope cut)
export { computeTokensHash, resolveTokens, computeMemoryDiff } from './compiler';
export type { TokenMap, ResolveResult, MemoryDiff } from './compiler';

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

// API key operations
export { createApiKey, listApiKeys, revokeApiKey, verifyApiKey } from './operations/api-keys';
export type { CreateApiKeyInput, ApiKeyWithRaw, ApiKeyContext } from './operations/api-keys';

// Project initialization with default tokens
export {
  initProject,
  createProjectWithDefaults,
  seedProjectWithDefaults,
} from './operations/init-project';
export type { InitProjectInput, InitProjectResult } from './operations/init-project';

// Default token set (used for fresh project init + reset)
export { DEFAULT_PROJECT_TOKENS } from './db/seed-data/default-tokens';

// Design token importers
export {
  detectFormat,
  parseTokens,
  parseCssVariables,
  parseTokensStudio,
  parseTailwindConfig,
} from './importers';
export type { ImportFormat, ImportResult } from './importers';

// Graph operations
export {
  getProjectGraph,
  createGraphNode,
  createGraphEdge,
  deleteGraphNode,
  deleteGraphEdge,
  autoGenerateGraph,
} from './operations/graph';

// Auth guards
export { verifyOrgMembership, verifyResourceOwnership } from './lib/auth-guards';

// Personas (reusable user-perspective definitions for critique_for_persona)
export { createPersonaSchema, updatePersonaSchema } from './validation/persona';
export type { CreatePersonaInput, UpdatePersonaInput } from './validation/persona';
export {
  createPersona,
  listPersonas,
  getPersona,
  getDefaultPersona,
  updatePersona,
  deletePersona,
} from './operations/personas';

// Evaluators — pure heuristics, no DB calls. Shared by web + mcp-server.
export {
  extractPersonaSignals,
  cognitiveLoadScore,
  type PersonaSignals,
} from './evaluators/persona-signals';
