/**
 * Figma API client and token extraction.
 *
 * Extracts design tokens from Figma files using the Figma REST API.
 * Supports color styles, text styles, effect styles, and local variables.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateTokenInput {
  tokenKey: string;
  tokenType: 'color' | 'radius' | 'font' | 'spacing' | 'shadow' | 'elevation';
  tokenValue: string;
  description?: string;
}

export interface FigmaExtractionResult {
  fileName: string;
  tokens: CreateTokenInput[];
  stats: {
    colors: number;
    fonts: number;
    shadows: number;
    spacing: number;
    radius: number;
    total: number;
  };
  warnings: string[];
}

/** Figma RGBA color (channels 0-1). */
interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaPaint {
  type: string;
  color?: FigmaColor;
  opacity?: number;
}

interface FigmaShadowEffect {
  type: string;
  visible?: boolean;
  color: FigmaColor;
  offset: { x: number; y: number };
  radius: number;
  spread?: number;
}

interface FigmaTypeStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  letterSpacing?: number;
}

interface FigmaStyleMeta {
  key: string;
  name: string;
  style_type: string;
  description?: string;
  node_id: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  fills?: FigmaPaint[];
  effects?: FigmaShadowEffect[];
  style?: FigmaTypeStyle;
  children?: FigmaNode[];
}

interface FigmaFileResponse {
  name: string;
  document: FigmaNode;
  styles?: Record<string, FigmaStyleMeta>;
}

interface FigmaStylesResponse {
  meta: {
    styles: FigmaStyleMeta[];
  };
}

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  valuesByMode: Record<string, unknown>;
}

interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

interface FigmaVariablesResponse {
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

// ---------------------------------------------------------------------------
// Token key pattern: ^[a-z]+\.[a-z][a-zA-Z0-9.-]*$
// ---------------------------------------------------------------------------

const TOKEN_KEY_REGEX = /^[a-z]+\.[a-z][a-zA-Z0-9.-]*$/;

const FIGMA_API_BASE = 'https://api.figma.com/v1';

// ---------------------------------------------------------------------------
// Figma URL parsing
// ---------------------------------------------------------------------------

/**
 * Extract a Figma file key from a Figma URL.
 *
 * Supported formats:
 *   https://www.figma.com/file/XXXXX/File-Name
 *   https://www.figma.com/design/XXXXX/File-Name
 *
 * Returns `null` when the URL does not match.
 */
export function parseFigmaUrl(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function toHexChannel(value01: number): string {
  const byte = Math.round(clamp01(value01) * 255);
  return byte.toString(16).padStart(2, '0');
}

/** Convert a Figma RGBA (0-1 channels) to a CSS hex string. */
function figmaColorToHex(color: FigmaColor): string {
  const r = toHexChannel(color.r);
  const g = toHexChannel(color.g);
  const b = toHexChannel(color.b);
  if (color.a !== undefined && color.a < 1) {
    const a = toHexChannel(color.a);
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}

function figmaColorToRgba(color: FigmaColor): string {
  const r = Math.round(clamp01(color.r) * 255);
  const g = Math.round(clamp01(color.g) * 255);
  const b = Math.round(clamp01(color.b) * 255);
  const a = Math.round(clamp01(color.a) * 100) / 100;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Convert a Figma style name to a valid token key.
 *
 * "Primary/500"   -> "primary500"
 * "Background"    -> "background"
 * "Text / Body"   -> "textBody"
 */
function sanitizeNameSegment(raw: string): string {
  // Split on separators: / , - , _ , spaces
  const parts = raw.split(/[\s/\-_]+/).filter(Boolean);

  if (parts.length === 0) return '';

  // camelCase join
  return parts
    .map((part, idx) => {
      const lower = part.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function buildTokenKey(prefix: string, rawName: string): string {
  const segment = sanitizeNameSegment(rawName);
  if (!segment) return '';
  const key = `${prefix}.${segment}`;
  if (TOKEN_KEY_REGEX.test(key)) return key;
  // Strip characters that violate the pattern
  const cleaned = key.replace(/[^a-zA-Z0-9.-]/g, '');
  return TOKEN_KEY_REGEX.test(cleaned) ? cleaned : '';
}

async function figmaFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${FIGMA_API_BASE}${path}`, {
    headers: { 'X-Figma-Token': accessToken },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Figma API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Node traversal helpers
// ---------------------------------------------------------------------------

function findNodeById(root: FigmaNode, id: string): FigmaNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function extractColorTokens(
  node: FigmaNode,
  styleMeta: FigmaStyleMeta,
  warnings: string[]
): CreateTokenInput | null {
  const fills = node.fills;
  if (!fills || fills.length === 0) {
    warnings.push(`Color style "${styleMeta.name}" has no fills`);
    return null;
  }
  const solidFill = fills.find((f) => f.type === 'SOLID' && f.color);
  if (!solidFill || !solidFill.color) {
    warnings.push(`Color style "${styleMeta.name}" has no solid fill`);
    return null;
  }
  const color: FigmaColor = {
    ...solidFill.color,
    a: solidFill.opacity !== undefined ? solidFill.opacity : solidFill.color.a,
  };
  const key = buildTokenKey('color', styleMeta.name);
  if (!key) {
    warnings.push(`Could not build valid token key for color style "${styleMeta.name}"`);
    return null;
  }
  return {
    tokenKey: key,
    tokenType: 'color',
    tokenValue: figmaColorToHex(color),
    ...(styleMeta.description ? { description: styleMeta.description } : {}),
  };
}

function extractTextTokens(
  node: FigmaNode,
  styleMeta: FigmaStyleMeta,
  warnings: string[]
): CreateTokenInput[] {
  const ts = node.style;
  if (!ts) {
    warnings.push(`Text style "${styleMeta.name}" has no type style data`);
    return [];
  }
  const baseName = sanitizeNameSegment(styleMeta.name);
  if (!baseName) {
    warnings.push(`Could not build valid token key for text style "${styleMeta.name}"`);
    return [];
  }
  const tokens: CreateTokenInput[] = [];
  const desc = styleMeta.description || undefined;

  // Font family
  const familyKey = `font.${baseName}`;
  if (TOKEN_KEY_REGEX.test(familyKey)) {
    tokens.push({
      tokenKey: familyKey,
      tokenType: 'font',
      tokenValue: ts.fontFamily,
      ...(desc ? { description: `${desc} - family` } : {}),
    });
  }

  // Font size
  const sizeKey = `font.${baseName}Size`;
  if (TOKEN_KEY_REGEX.test(sizeKey)) {
    tokens.push({
      tokenKey: sizeKey,
      tokenType: 'font',
      tokenValue: `${ts.fontSize}px`,
      ...(desc ? { description: `${desc} - size` } : {}),
    });
  }

  // Font weight
  const weightKey = `font.${baseName}Weight`;
  if (TOKEN_KEY_REGEX.test(weightKey)) {
    tokens.push({
      tokenKey: weightKey,
      tokenType: 'font',
      tokenValue: String(ts.fontWeight),
      ...(desc ? { description: `${desc} - weight` } : {}),
    });
  }

  // Line height (if available)
  if (ts.lineHeightPx !== undefined) {
    const lhKey = `font.${baseName}LineHeight`;
    if (TOKEN_KEY_REGEX.test(lhKey)) {
      tokens.push({
        tokenKey: lhKey,
        tokenType: 'font',
        tokenValue: `${ts.lineHeightPx}px`,
      });
    }
  }

  // Letter spacing (if available)
  if (ts.letterSpacing !== undefined && ts.letterSpacing !== 0) {
    const lsKey = `font.${baseName}LetterSpacing`;
    if (TOKEN_KEY_REGEX.test(lsKey)) {
      tokens.push({
        tokenKey: lsKey,
        tokenType: 'font',
        tokenValue: `${ts.letterSpacing}px`,
      });
    }
  }

  return tokens;
}

function extractShadowTokens(
  node: FigmaNode,
  styleMeta: FigmaStyleMeta,
  warnings: string[]
): CreateTokenInput | null {
  const effects = node.effects;
  if (!effects || effects.length === 0) {
    warnings.push(`Effect style "${styleMeta.name}" has no effects`);
    return null;
  }
  const shadow = effects.find(
    (e) => (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.visible !== false
  );
  if (!shadow) {
    warnings.push(`Effect style "${styleMeta.name}" has no visible shadow effects`);
    return null;
  }
  const x = Math.round(shadow.offset.x);
  const y = Math.round(shadow.offset.y);
  const blur = Math.round(shadow.radius);
  const spread = Math.round(shadow.spread ?? 0);
  const rgba = figmaColorToRgba(shadow.color);
  const cssValue = `${x}px ${y}px ${blur}px ${spread}px ${rgba}`;

  const key = buildTokenKey('shadow', styleMeta.name);
  if (!key) {
    warnings.push(`Could not build valid token key for effect style "${styleMeta.name}"`);
    return null;
  }
  return {
    tokenKey: key,
    tokenType: 'shadow',
    tokenValue: cssValue,
    ...(styleMeta.description ? { description: styleMeta.description } : {}),
  };
}

// ---------------------------------------------------------------------------
// Variables extraction
// ---------------------------------------------------------------------------

function extractVariableTokens(
  data: FigmaVariablesResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _warnings: string[]
): CreateTokenInput[] {
  const tokens: CreateTokenInput[] = [];
  const { variables } = data.meta;

  for (const variable of Object.values(variables)) {
    // Take the first mode's value
    const modeIds = Object.keys(variable.valuesByMode);
    if (modeIds.length === 0) continue;
    const rawValue = variable.valuesByMode[modeIds[0]];

    const nameParts = variable.name.replace(/\//g, '-');
    const desc = variable.description || undefined;

    if (variable.resolvedType === 'COLOR') {
      // Value is an object {r, g, b, a} with 0-1 values
      if (rawValue && typeof rawValue === 'object' && 'r' in rawValue) {
        const color = rawValue as unknown as FigmaColor;
        const key = buildTokenKey('color', nameParts);
        if (key) {
          tokens.push({
            tokenKey: key,
            tokenType: 'color',
            tokenValue: figmaColorToHex(color),
            ...(desc ? { description: desc } : {}),
          });
        }
      }
    } else if (variable.resolvedType === 'FLOAT') {
      const numValue = rawValue as number;
      if (typeof numValue !== 'number') continue;

      // Heuristic: detect spacing vs radius by name
      const lowerName = variable.name.toLowerCase();
      const isRadius =
        lowerName.includes('radius') || lowerName.includes('round') || lowerName.includes('corner');
      const tokenType = isRadius ? 'radius' : 'spacing';
      const prefix = isRadius ? 'radius' : 'spacing';

      const key = buildTokenKey(prefix, nameParts);
      if (key) {
        tokens.push({
          tokenKey: key,
          tokenType,
          tokenValue: `${numValue}px`,
          ...(desc ? { description: desc } : {}),
        });
      }
    } else if (variable.resolvedType === 'STRING') {
      const strValue = rawValue as string;
      if (typeof strValue !== 'string' || !strValue) continue;

      const key = buildTokenKey('font', nameParts);
      if (key) {
        tokens.push({
          tokenKey: key,
          tokenType: 'font',
          tokenValue: strValue,
          ...(desc ? { description: desc } : {}),
        });
      }
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------

/**
 * Extract design tokens from a Figma file using the REST API.
 *
 * Requires a personal access token or OAuth token with file read scope.
 */
export async function extractFigmaTokens(
  fileKey: string,
  accessToken: string
): Promise<FigmaExtractionResult> {
  const warnings: string[] = [];
  const tokens: CreateTokenInput[] = [];

  // 1. Fetch the file (includes document tree + style map)
  const file = await figmaFetch<FigmaFileResponse>(`/files/${fileKey}`, accessToken);

  // 2. Fetch published styles metadata
  let stylesMeta: FigmaStyleMeta[] = [];
  try {
    const stylesRes = await figmaFetch<FigmaStylesResponse>(
      `/files/${fileKey}/styles`,
      accessToken
    );
    stylesMeta = stylesRes.meta.styles;
  } catch (err) {
    warnings.push(
      `Could not fetch published styles: ${err instanceof Error ? err.message : String(err)}`
    );
    // Fall back to styles embedded in file response
    if (file.styles) {
      stylesMeta = Object.entries(file.styles).map(([nodeId, meta]) => ({
        ...meta,
        node_id: nodeId,
      }));
    }
  }

  // 3. Process styles by looking up their nodes in the document tree
  for (const styleMeta of stylesMeta) {
    const nodeId = styleMeta.node_id;
    const node = findNodeById(file.document, nodeId);
    if (!node) {
      warnings.push(`Node ${nodeId} for style "${styleMeta.name}" not found in document`);
      continue;
    }

    try {
      if (styleMeta.style_type === 'FILL') {
        const token = extractColorTokens(node, styleMeta, warnings);
        if (token) tokens.push(token);
      } else if (styleMeta.style_type === 'TEXT') {
        tokens.push(...extractTextTokens(node, styleMeta, warnings));
      } else if (styleMeta.style_type === 'EFFECT') {
        const token = extractShadowTokens(node, styleMeta, warnings);
        if (token) tokens.push(token);
      }
    } catch (err) {
      warnings.push(
        `Error processing style "${styleMeta.name}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 4. Fetch variables (may not be available for all plans)
  try {
    const varsRes = await figmaFetch<FigmaVariablesResponse>(
      `/files/${fileKey}/variables/local`,
      accessToken
    );
    const varTokens = extractVariableTokens(varsRes, warnings);
    tokens.push(...varTokens);
  } catch (err) {
    warnings.push(`Could not fetch variables: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 5. Deduplicate by tokenKey (first occurrence wins)
  const seen = new Set<string>();
  const deduped: CreateTokenInput[] = [];
  for (const token of tokens) {
    if (!seen.has(token.tokenKey)) {
      seen.add(token.tokenKey);
      deduped.push(token);
    }
  }

  // 6. Build stats
  const stats = { colors: 0, fonts: 0, shadows: 0, spacing: 0, radius: 0, total: 0 };
  for (const token of deduped) {
    switch (token.tokenType) {
      case 'color':
        stats.colors++;
        break;
      case 'font':
        stats.fonts++;
        break;
      case 'shadow':
        stats.shadows++;
        break;
      case 'spacing':
        stats.spacing++;
        break;
      case 'radius':
        stats.radius++;
        break;
    }
    stats.total++;
  }

  return {
    fileName: file.name,
    tokens: deduped,
    stats,
    warnings,
  };
}
