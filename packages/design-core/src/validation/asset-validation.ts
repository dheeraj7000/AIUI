/**
 * Asset type validation — defines allowed file types and size limits per asset category.
 */

export type AssetType = 'logo' | 'font' | 'icon' | 'illustration' | 'screenshot' | 'brand-media';

const ASSET_TYPES: readonly string[] = [
  'logo',
  'font',
  'icon',
  'illustration',
  'screenshot',
  'brand-media',
];

export interface AssetTypeConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  description: string;
}

export const ASSET_TYPE_CONFIG: Record<AssetType, AssetTypeConfig> = {
  logo: {
    allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/webp'],
    allowedExtensions: ['.svg', '.png', '.webp'],
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    description: 'Logo images',
  },
  font: {
    allowedMimeTypes: [
      'font/woff2',
      'font/woff',
      'font/ttf',
      'font/otf',
      'application/font-woff2',
      'application/font-woff',
      'application/x-font-ttf',
      'application/vnd.ms-opentype',
    ],
    allowedExtensions: ['.woff2', '.woff', '.ttf', '.otf'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    description: 'Web fonts',
  },
  icon: {
    allowedMimeTypes: ['image/svg+xml'],
    allowedExtensions: ['.svg'],
    maxSizeBytes: 500 * 1024, // 500KB
    description: 'SVG icons',
  },
  illustration: {
    allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/webp'],
    allowedExtensions: ['.svg', '.png', '.webp'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    description: 'Illustrations and graphics',
  },
  screenshot: {
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    description: 'Screenshots',
  },
  'brand-media': {
    allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    allowedExtensions: ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    description: 'Brand media files',
  },
};

/**
 * Type-guard that checks whether a string is a valid AssetType.
 */
export function isValidAssetType(type: string): type is AssetType {
  return ASSET_TYPES.includes(type);
}

/**
 * Returns the configuration for a given asset type.
 * Throws if the asset type is invalid.
 */
export function getAssetTypeConfig(assetType: AssetType): AssetTypeConfig {
  const config = ASSET_TYPE_CONFIG[assetType];
  if (!config) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }
  return config;
}

/**
 * Formats a byte count into a human-readable string (e.g. "2MB", "500KB").
 */
export function formatSizeLimit(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${Number.isInteger(kb) ? kb : kb.toFixed(1)}KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
}

export interface AssetUploadParams {
  assetType: AssetType;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface AssetValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Extracts the file extension from a filename (lowercase, including the dot).
 */
function extractExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

/**
 * Validates an asset upload against the rules for its asset type.
 * Returns a result object with `valid` (boolean) and `errors` (string[]).
 */
export function validateAssetUpload(params: AssetUploadParams): AssetValidationResult {
  const { assetType, fileName, contentType, fileSize } = params;
  const errors: string[] = [];

  if (!isValidAssetType(assetType)) {
    return { valid: false, errors: [`Unknown asset type: ${assetType}`] };
  }

  const config = getAssetTypeConfig(assetType);

  // Validate MIME type
  if (!config.allowedMimeTypes.includes(contentType)) {
    errors.push(
      `Content type "${contentType}" is not allowed for ${assetType}. Allowed types: ${config.allowedMimeTypes.join(', ')}`
    );
  }

  // Validate file extension
  const ext = extractExtension(fileName);
  if (!ext) {
    errors.push(
      `File "${fileName}" has no extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    );
  } else if (!config.allowedExtensions.includes(ext)) {
    errors.push(
      `Extension "${ext}" is not allowed for ${assetType}. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    );
  }

  // Validate file size
  if (fileSize > config.maxSizeBytes) {
    errors.push(
      `File size ${formatSizeLimit(fileSize)} exceeds the ${formatSizeLimit(config.maxSizeBytes)} limit for ${assetType}`
    );
  }

  return { valid: errors.length === 0, errors };
}
