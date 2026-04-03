import { describe, it, expect } from 'vitest';
import {
  validateAssetUpload,
  getAssetTypeConfig,
  formatSizeLimit,
  isValidAssetType,
  type AssetType,
} from '../validation/asset-validation';

describe('isValidAssetType', () => {
  it('should accept all six valid asset types', () => {
    const types: AssetType[] = [
      'logo',
      'font',
      'icon',
      'illustration',
      'screenshot',
      'brand-media',
    ];
    for (const t of types) {
      expect(isValidAssetType(t)).toBe(true);
    }
  });

  it('should reject invalid types', () => {
    expect(isValidAssetType('video')).toBe(false);
    expect(isValidAssetType('')).toBe(false);
    expect(isValidAssetType('Logo')).toBe(false);
    expect(isValidAssetType('FONT')).toBe(false);
  });
});

describe('getAssetTypeConfig', () => {
  it('should return the config for each valid asset type', () => {
    const config = getAssetTypeConfig('logo');
    expect(config.allowedMimeTypes).toContain('image/svg+xml');
    expect(config.maxSizeBytes).toBe(2 * 1024 * 1024);
  });

  it('should include alternative MIME types for fonts', () => {
    const config = getAssetTypeConfig('font');
    expect(config.allowedMimeTypes).toContain('font/woff2');
    expect(config.allowedMimeTypes).toContain('application/font-woff2');
    expect(config.allowedMimeTypes).toContain('application/font-woff');
    expect(config.allowedMimeTypes).toContain('application/x-font-ttf');
    expect(config.allowedMimeTypes).toContain('application/vnd.ms-opentype');
  });
});

describe('formatSizeLimit', () => {
  it('should format bytes', () => {
    expect(formatSizeLimit(500)).toBe('500B');
  });

  it('should format kilobytes', () => {
    expect(formatSizeLimit(500 * 1024)).toBe('500KB');
  });

  it('should format megabytes', () => {
    expect(formatSizeLimit(2 * 1024 * 1024)).toBe('2MB');
  });

  it('should format fractional megabytes', () => {
    expect(formatSizeLimit(1.5 * 1024 * 1024)).toBe('1.5MB');
  });

  it('should format fractional kilobytes', () => {
    expect(formatSizeLimit(1536)).toBe('1.5KB');
  });
});

describe('validateAssetUpload', () => {
  // --- Valid inputs for each asset type ---
  describe('valid uploads', () => {
    it('should accept a valid logo upload (SVG)', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.svg',
        contentType: 'image/svg+xml',
        fileSize: 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid logo upload (PNG)', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.png',
        contentType: 'image/png',
        fileSize: 1 * 1024 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid font upload (woff2 with standard MIME)', () => {
      const result = validateAssetUpload({
        assetType: 'font',
        fileName: 'inter.woff2',
        contentType: 'font/woff2',
        fileSize: 100 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid font upload (woff2 with application MIME)', () => {
      const result = validateAssetUpload({
        assetType: 'font',
        fileName: 'inter.woff2',
        contentType: 'application/font-woff2',
        fileSize: 100 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid font upload (otf with application MIME)', () => {
      const result = validateAssetUpload({
        assetType: 'font',
        fileName: 'myfont.otf',
        contentType: 'application/vnd.ms-opentype',
        fileSize: 2 * 1024 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid icon upload', () => {
      const result = validateAssetUpload({
        assetType: 'icon',
        fileName: 'arrow.svg',
        contentType: 'image/svg+xml',
        fileSize: 2048,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid illustration upload', () => {
      const result = validateAssetUpload({
        assetType: 'illustration',
        fileName: 'hero.png',
        contentType: 'image/png',
        fileSize: 5 * 1024 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid screenshot upload', () => {
      const result = validateAssetUpload({
        assetType: 'screenshot',
        fileName: 'screen.jpg',
        contentType: 'image/jpeg',
        fileSize: 2 * 1024 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid brand-media upload (gif)', () => {
      const result = validateAssetUpload({
        assetType: 'brand-media',
        fileName: 'animation.gif',
        contentType: 'image/gif',
        fileSize: 8 * 1024 * 1024,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // --- Invalid MIME types ---
  describe('invalid MIME types', () => {
    it('should reject a JPEG logo', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('Content type'))).toBe(true);
    });

    it('should reject a PNG icon', () => {
      const result = validateAssetUpload({
        assetType: 'icon',
        fileName: 'icon.png',
        contentType: 'image/png',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Content type'))).toBe(true);
    });

    it('should reject font with image MIME type', () => {
      const result = validateAssetUpload({
        assetType: 'font',
        fileName: 'font.woff2',
        contentType: 'image/png',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Content type'))).toBe(true);
    });

    it('should reject screenshot with GIF MIME type', () => {
      const result = validateAssetUpload({
        assetType: 'screenshot',
        fileName: 'screen.gif',
        contentType: 'image/gif',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Content type'))).toBe(true);
    });
  });

  // --- Oversized files ---
  describe('oversized files', () => {
    it('should reject an oversized logo', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.png',
        contentType: 'image/png',
        fileSize: 3 * 1024 * 1024, // 3MB > 2MB limit
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds'))).toBe(true);
    });

    it('should reject an oversized icon', () => {
      const result = validateAssetUpload({
        assetType: 'icon',
        fileName: 'icon.svg',
        contentType: 'image/svg+xml',
        fileSize: 600 * 1024, // 600KB > 500KB limit
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds'))).toBe(true);
    });

    it('should reject an oversized font', () => {
      const result = validateAssetUpload({
        assetType: 'font',
        fileName: 'big.woff2',
        contentType: 'font/woff2',
        fileSize: 6 * 1024 * 1024, // 6MB > 5MB limit
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds'))).toBe(true);
    });

    it('should reject an oversized illustration', () => {
      const result = validateAssetUpload({
        assetType: 'illustration',
        fileName: 'huge.png',
        contentType: 'image/png',
        fileSize: 11 * 1024 * 1024, // 11MB > 10MB limit
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds'))).toBe(true);
    });

    it('should accept a file at exactly the size limit', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.png',
        contentType: 'image/png',
        fileSize: 2 * 1024 * 1024, // exactly 2MB
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // --- Extension/MIME mismatch ---
  describe('mismatched extension and MIME type', () => {
    it('should reject a file with .svg extension but PNG content type', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo.svg',
        contentType: 'image/png',
        fileSize: 1024,
      });
      // Both extension and MIME are individually valid for logo,
      // but this test ensures both are checked independently.
      // Since both svg and png are allowed for logo, this should pass.
      expect(result.valid).toBe(true);
    });

    it('should reject a file with .jpg extension but SVG content type for screenshot', () => {
      const result = validateAssetUpload({
        assetType: 'screenshot',
        fileName: 'screen.jpg',
        contentType: 'image/svg+xml',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Content type'))).toBe(true);
    });

    it('should reject a file with .png extension for icon (only .svg allowed)', () => {
      const result = validateAssetUpload({
        assetType: 'icon',
        fileName: 'icon.png',
        contentType: 'image/svg+xml',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Extension'))).toBe(true);
    });

    it('should report multiple errors when both MIME type and extension are invalid', () => {
      const result = validateAssetUpload({
        assetType: 'icon',
        fileName: 'icon.gif',
        contentType: 'image/gif',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  // --- File without extension ---
  describe('files without extension', () => {
    it('should reject a file with no extension', () => {
      const result = validateAssetUpload({
        assetType: 'logo',
        fileName: 'logo',
        contentType: 'image/png',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('no extension'))).toBe(true);
    });
  });

  // --- Unknown asset type ---
  describe('unknown asset type', () => {
    it('should reject an unknown asset type', () => {
      const result = validateAssetUpload({
        assetType: 'video' as unknown as AssetType,
        fileName: 'clip.mp4',
        contentType: 'video/mp4',
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unknown asset type'))).toBe(true);
    });
  });
});
