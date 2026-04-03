/**
 * Metadata extraction pipeline for uploaded assets.
 * Extracts dimensions, color palettes, font properties, and MIME information.
 */

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from './s3';

// ---------- Type definitions ----------

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace?: string;
  palette: string[];
}

export interface SvgMetadata {
  viewBoxWidth: number;
  viewBoxHeight: number;
  colors: string[];
}

export interface FontMetadata {
  family: string;
  weights: number[];
  format: string;
  characterSets: string[];
}

export interface BaseMetadata {
  fileSize: number;
  mimeType: string;
  extractedAt: string;
  extractionError?: string;
}

export type AssetMetadata = BaseMetadata &
  Partial<ImageMetadata> &
  Partial<SvgMetadata> &
  Partial<FontMetadata>;

// ---------- Image metadata ----------

export async function extractImageMetadata(
  buffer: Buffer,
  mimeType: string
): Promise<ImageMetadata> {
  // Dynamic import to avoid bundling issues
  const sharp = (await import('sharp')).default;

  const image = sharp(buffer);
  const metadata = await image.metadata();
  const stats = await image.stats();

  // Extract dominant colors from channel stats
  const palette: string[] = [];
  if (stats.dominant) {
    const { r, g, b } = stats.dominant;
    palette.push(rgbToHex(r, g, b));
  }

  // Sample additional colors from channel means
  if (stats.channels.length >= 3) {
    const channels = stats.channels;
    palette.push(
      rgbToHex(
        Math.round(channels[0].mean),
        Math.round(channels[1].mean),
        Math.round(channels[2].mean)
      )
    );
  }

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? mimeType.split('/')[1] ?? 'unknown',
    colorSpace: metadata.space,
    palette: [...new Set(palette)].slice(0, 5),
  };
}

// ---------- SVG metadata ----------

export async function extractSvgMetadata(buffer: Buffer): Promise<SvgMetadata> {
  const svgString = buffer.toString('utf-8');

  // Extract viewBox
  let viewBoxWidth = 0;
  let viewBoxHeight = 0;

  const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/);
    if (parts.length === 4) {
      viewBoxWidth = parseFloat(parts[2]) || 0;
      viewBoxHeight = parseFloat(parts[3]) || 0;
    }
  }

  // Fallback to width/height attributes
  if (viewBoxWidth === 0) {
    const widthMatch = svgString.match(/<svg[^>]*\swidth=["'](\d+(?:\.\d+)?)/);
    if (widthMatch) viewBoxWidth = parseFloat(widthMatch[1]);
  }
  if (viewBoxHeight === 0) {
    const heightMatch = svgString.match(/<svg[^>]*\sheight=["'](\d+(?:\.\d+)?)/);
    if (heightMatch) viewBoxHeight = parseFloat(heightMatch[1]);
  }

  // Extract colors from fill and stroke attributes
  const colorRegex = /(?:fill|stroke)=["'](#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[a-zA-Z]+)["']/g;
  const colors: string[] = [];
  let match;
  while ((match = colorRegex.exec(svgString)) !== null) {
    const color = match[1];
    if (color !== 'none' && color !== 'transparent' && !colors.includes(color)) {
      colors.push(color);
    }
  }

  return { viewBoxWidth, viewBoxHeight, colors: colors.slice(0, 10) };
}

// ---------- Font metadata ----------

export async function extractFontMetadata(buffer: Buffer, mimeType: string): Promise<FontMetadata> {
  const opentype = await import('opentype.js');

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const font = opentype.parse(arrayBuffer);

  const family = font.names.fontFamily?.en || font.names.fontFamily?.['en-US'] || 'Unknown';

  // Determine weights from OS/2 table or name entries
  const weights: number[] = [];
  if (font.tables.os2?.usWeightClass) {
    weights.push(font.tables.os2.usWeightClass);
  }

  // Determine format from MIME type
  const formatMap: Record<string, string> = {
    'font/woff2': 'woff2',
    'font/woff': 'woff',
    'font/ttf': 'ttf',
    'font/otf': 'otf',
    'application/font-woff2': 'woff2',
    'application/font-woff': 'woff',
    'application/x-font-ttf': 'ttf',
    'application/x-font-otf': 'otf',
  };
  const format = formatMap[mimeType] ?? 'unknown';

  // Basic character set detection
  const characterSets: string[] = ['Latin'];
  if (font.tables.os2?.ulUnicodeRange2) {
    const range2 = font.tables.os2.ulUnicodeRange2;
    if (range2 & (1 << 19)) characterSets.push('CJK');
    if (range2 & (1 << 15)) characterSets.push('Arabic');
  }

  return { family, weights, format, characterSets };
}

// ---------- Main router ----------

/**
 * Route to the correct extractor based on MIME type.
 * Always includes common fields: fileSize, mimeType, extractedAt.
 * Wraps extraction in try/catch; returns partial metadata with extractionError on failure.
 */
export async function extractMetadata(
  buffer: Buffer,
  mimeType: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  assetType: string
): Promise<AssetMetadata> {
  const base: BaseMetadata = {
    fileSize: buffer.length,
    mimeType,
    extractedAt: new Date().toISOString(),
  };

  try {
    if (mimeType === 'image/svg+xml') {
      const svg = await extractSvgMetadata(buffer);
      return { ...base, ...svg };
    }

    if (mimeType.startsWith('image/')) {
      const img = await extractImageMetadata(buffer, mimeType);
      return { ...base, ...img };
    }

    if (
      mimeType.startsWith('font/') ||
      mimeType.includes('font-woff') ||
      mimeType.includes('font-ttf') ||
      mimeType.includes('font-otf')
    ) {
      const font = await extractFontMetadata(buffer, mimeType);
      return { ...base, ...font };
    }

    // Unsupported type — return base metadata only
    return base;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown extraction error';
    return { ...base, extractionError: message };
  }
}

/**
 * Fetch a file from S3 and extract its metadata.
 * Primary entry point called after upload confirmation.
 */
export async function extractMetadataFromS3(
  storageKey: string,
  mimeType: string,
  assetType: string,
  bucket?: string
): Promise<AssetMetadata> {
  const s3 = createS3Client();
  const bucketName = bucket ?? process.env.S3_ASSETS_BUCKET;

  if (!bucketName) {
    return {
      fileSize: 0,
      mimeType,
      extractedAt: new Date().toISOString(),
      extractionError: 'S3_ASSETS_BUCKET not configured',
    };
  }

  const response = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: storageKey }));

  const stream = response.Body;
  if (!stream) {
    return {
      fileSize: 0,
      mimeType,
      extractedAt: new Date().toISOString(),
      extractionError: 'Empty response from S3',
    };
  }

  const chunks: Uint8Array[] = [];
  // @ts-expect-error — S3 body is an async iterable in Node environments
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  return extractMetadata(buffer, mimeType, assetType);
}

// ---------- Helpers ----------

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')
  );
}
