/**
 * Pure, dependency-free detectors for UI-code validation.
 *
 * Re-exported from validate-ui-output.ts for the MCP tool and imported
 * directly by @aiui/cli (and any other workspace consumer) via the
 * `@aiui/mcp-server/detectors` subpath export.
 *
 * Keep this module free of db / server / zod / drizzle imports so that
 * it can be consumed by lightweight CLI contexts.
 */

export interface Violation {
  type:
    | 'color'
    | 'font'
    | 'spacing'
    | 'radius'
    | 'font-size'
    | 'z-index'
    | 'opacity'
    | 'border-width'
    | 'accessibility'
    | 'component'
    | 'general';
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

// ---------------------------------------------------------------------------
// Color & Tailwind detectors
// ---------------------------------------------------------------------------

/** CSS Level 4 named colors (excludes neutral keywords that are always safe). */
export const CSS_NAMED_COLORS: ReadonlySet<string> = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgrey',
  'darkgreen',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'grey',
  'green',
  'greenyellow',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgrey',
  'lightgreen',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
]);

/** Tailwind default palette color names. */
export const TAILWIND_PALETTE: ReadonlySet<string> = new Set([
  'red',
  'blue',
  'green',
  'slate',
  'zinc',
  'stone',
  'gray',
  'neutral',
  'amber',
  'yellow',
  'lime',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'orange',
]);

const TAILWIND_COLOR_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'from',
  'to',
  'via',
  'fill',
  'stroke',
  'divide',
  'outline',
  'decoration',
  'placeholder',
  'caret',
  'accent',
  'shadow',
];

/**
 * Extract hardcoded color literals: hex, rgb/rgba, hsl/hsla, oklch/oklab, named colors.
 * Skips var(--...) references and neutral keywords.
 */
export function extractColors(code: string): string[] {
  const found: Set<string> = new Set();

  const hexMatches = code.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hexMatches) for (const c of hexMatches) found.add(c);

  const fnPattern = /\b(?:rgb|rgba|hsl|hsla|hwb|oklch|oklab|lab|lch|color)\s*\([^()]*\)/gi;
  const fnMatches = code.match(fnPattern);
  if (fnMatches) for (const c of fnMatches) found.add(c.toLowerCase());

  const named = Array.from(CSS_NAMED_COLORS).join('|');
  const namedPattern = new RegExp(`(?:^|[\\s:"'\`(,;])(${named})(?=[\\s;,"'\`)}]|$)`, 'gi');
  let nm: RegExpExecArray | null;
  while ((nm = namedPattern.exec(code)) !== null) {
    found.add(nm[1].toLowerCase());
  }

  return [...found];
}

/**
 * Extract colors with their line numbers. Used by the CLI for line-annotated reports.
 */
export function extractColorsWithLines(code: string): Array<{ value: string; line: number }> {
  const out: Array<{ value: string; line: number }> = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const found = extractColors(lines[i]);
    for (const v of found) out.push({ value: v, line: i + 1 });
  }
  return out;
}

/**
 * Detect Tailwind palette utilities (bg-red-500, hover:text-blue-600) and
 * arbitrary-value classes containing raw colors/lengths.
 */
export function extractTailwindViolations(
  code: string,
  approved: ReadonlySet<string> = new Set()
): { value: string; kind: 'utility' | 'arbitrary'; line?: number }[] {
  const out: { value: string; kind: 'utility' | 'arbitrary'; line?: number }[] = [];
  const seen: Set<string> = new Set();

  const lines = code.split('\n');
  const paletteAlt = Array.from(TAILWIND_PALETTE).join('|');
  const prefixAlt = TAILWIND_COLOR_PREFIXES.join('|');

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const paletteRe = new RegExp(
      `(?<![A-Za-z0-9_-])-?(?:${prefixAlt})-(?:${paletteAlt})-(?:50|[1-9]00|950)(?:\\/\\d{1,3})?\\b`,
      'g'
    );
    let pm: RegExpExecArray | null;
    while ((pm = paletteRe.exec(line)) !== null) {
      const cls = pm[0].replace(/^-/, '');
      if (approved.has(cls.toLowerCase())) continue;
      const key = `u:${cls}:${li}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ value: cls, kind: 'utility', line: li + 1 });
    }

    const arbRe = /(?<![A-Za-z0-9_-])-?[a-z][a-z0-9-]*-\[([^\]\s]+)\]/gi;
    let am: RegExpExecArray | null;
    while ((am = arbRe.exec(line)) !== null) {
      const whole = am[0].replace(/^-/, '');
      const inside = am[1];
      if (/^var\(/i.test(inside)) continue;
      if (/^url\(/i.test(inside)) continue;
      const looksLikeStyle =
        /^#[0-9a-f]{3,8}$/i.test(inside) ||
        /^(?:rgb|rgba|hsl|hsla|oklch|oklab|color)\(/i.test(inside) ||
        /^-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|ch|pt)?$/i.test(inside) ||
        CSS_NAMED_COLORS.has(inside.toLowerCase());
      if (!looksLikeStyle) continue;
      const key = `a:${whole}:${li}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ value: whole, kind: 'arbitrary', line: li + 1 });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Scalar token-value extractors
// ---------------------------------------------------------------------------

export function extractFonts(code: string): string[] {
  const matches = code.match(/font-(?:family|sans|serif|mono)[\s:]*["']?([^"';,}]+)/g);
  return matches ? [...new Set(matches)] : [];
}

function extractCssNumericValues(
  code: string,
  propertyPattern: RegExp,
  unitPattern: RegExp
): string[] {
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  const re = new RegExp(propertyPattern.source, propertyPattern.flags);
  while ((m = re.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(unitPattern);
    if (nums) for (const n of nums) values.add(n.toLowerCase());
  }
  return [...values];
}

export function extractSpacingValues(code: string): string[] {
  const pattern =
    /(?:margin|padding|gap)(?:-(?:top|right|bottom|left|inline|block))?[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    const nums = raw.match(/(?<!\w)(\d+(?:\.\d+)?(?:px|rem))\b/gi);
    if (nums && !raw.includes('var(')) {
      for (const n of nums) values.add(n.toLowerCase());
    }
  }
  return [...values];
}

export function extractBorderRadiusValues(code: string): string[] {
  return extractCssNumericValues(
    code,
    /border-radius[\s]*:[\s]*([^;{}]+)/gi,
    /(?<!\w)(\d+(?:\.\d+)?(?:px|rem|%))\b/gi
  );
}
export function extractFontSizes(code: string): string[] {
  return extractCssNumericValues(
    code,
    /font-size[\s]*:[\s]*([^;{}]+)/gi,
    /(?<!\w)(\d+(?:\.\d+)?(?:px|rem|em))\b/gi
  );
}
export function extractZIndexValues(code: string): string[] {
  const values: Set<string> = new Set();
  const pattern = /z-index[\s]*:[\s]*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(-?\d+)/g);
    if (nums) for (const n of nums) values.add(n);
  }
  return [...values];
}
export function extractOpacityValues(code: string): string[] {
  const values: Set<string> = new Set();
  const pattern = /opacity[\s]*:[\s]*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(\d+(?:\.\d+)?)/g);
    if (nums) for (const n of nums) values.add(n);
  }
  return [...values];
}
export function extractBorderWidthValues(code: string): string[] {
  return extractCssNumericValues(
    code,
    /border(?:-(?:top|right|bottom|left))?-width[\s]*:[\s]*([^;{}]+)/gi,
    /(?<!\w)(\d+(?:\.\d+)?(?:px|rem))\b/gi
  );
}

// ---------------------------------------------------------------------------
// Accessibility checks
// ---------------------------------------------------------------------------

export function checkImgAlt(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<img\b/i.test(line) && !/\balt\s*=/i.test(line)) {
      violations.push({
        type: 'accessibility',
        severity: 'warning',
        message: '<img> tag missing alt attribute',
        line: i + 1,
      });
    }
  }
  return violations;
}

export function checkButtonLabels(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<[Bb]utton\b/i.test(line)) {
      const hasAriaLabel = /aria-label\s*=/i.test(line);
      const isSelfClosing = /\/\s*>/.test(line);
      const isEmpty = /<[Bb]utton[^>]*>\s*<\/[Bb]utton>/i.test(line);
      if (!hasAriaLabel && (isSelfClosing || isEmpty)) {
        violations.push({
          type: 'accessibility',
          severity: 'warning',
          message: '<button> without text content or aria-label',
          line: i + 1,
        });
      }
    }
  }
  return violations;
}

export function checkFormLabels(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<input\b/i.test(line)) {
      const hasAriaLabel = /aria-label\s*=/i.test(line);
      const hasAriaLabelledBy = /aria-labelledby\s*=/i.test(line);
      const hasId = /\bid\s*=/i.test(line);
      const prevLine = i > 0 ? lines[i - 1] : '';
      const hasLabelBefore = /<label\b/i.test(prevLine);
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasId && !hasLabelBefore) {
        violations.push({
          type: 'accessibility',
          severity: 'warning',
          message: '<input> without associated label or aria-label',
          line: i + 1,
        });
      }
    }
  }
  return violations;
}

export function checkHeadingOrder(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  let lastLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let hm: RegExpExecArray | null;
    const linePattern = /<h([1-6])\b/gi;
    while ((hm = linePattern.exec(line)) !== null) {
      const level = parseInt(hm[1], 10);
      if (lastLevel > 0 && level > lastLevel + 1) {
        violations.push({
          type: 'accessibility',
          severity: 'warning',
          message: `Heading level skipped: h${lastLevel} -> h${level}`,
          line: i + 1,
        });
      }
      lastLevel = level;
    }
  }
  return violations;
}

export function checkAriaRoles(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/onClick/i.test(line)) {
      if (/<(?:button|a|input|select|textarea|details|summary)\b/i.test(line)) continue;
      if (/\brole\s*=/i.test(line)) continue;
      violations.push({
        type: 'accessibility',
        severity: 'warning',
        message: 'Interactive element (onClick) without role attribute',
        line: i + 1,
      });
    }
  }
  return violations;
}

function hexToLuminance(hex: string): number | null {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function checkColorContrast(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fgMatch = line.match(/(?:^|[;\s{])color\s*:\s*(#[0-9a-fA-F]{3,8})\b/);
    const bgMatch = line.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})\b/);
    if (fgMatch && bgMatch) {
      const fgLum = hexToLuminance(fgMatch[1]);
      const bgLum = hexToLuminance(bgMatch[1]);
      if (fgLum !== null && bgLum !== null) {
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        if (ratio < 4.5) {
          violations.push({
            type: 'accessibility',
            severity: 'warning',
            message: `Low color contrast ratio (${ratio.toFixed(2)}:1) between ${fgMatch[1]} and ${bgMatch[1]} \u2014 WCAG AA requires 4.5:1`,
            line: i + 1,
          });
        }
      }
    }
  }
  return violations;
}

/** Run every a11y detector on a blob of code and return combined violations. */
export function runAllAccessibilityChecks(code: string): Violation[] {
  return [
    ...checkImgAlt(code),
    ...checkButtonLabels(code),
    ...checkFormLabels(code),
    ...checkHeadingOrder(code),
    ...checkAriaRoles(code),
    ...checkColorContrast(code),
  ];
}

// ---------------------------------------------------------------------------
// Design Principle Heuristics
// ---------------------------------------------------------------------------

/**
 * Check if heading sizes are logically decreasing (h1 > h2 > h3).
 */
export function checkTypographicHierarchy(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  const headingSizes: Record<number, number> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sizeMatch = line.match(/font-size\s*:\s*(\d+)(?:px|rem)/i);
    const headingMatch = line.match(/<h([1-6])\b/i);

    if (headingMatch && sizeMatch) {
      const level = parseInt(headingMatch[1], 10);
      const size = parseInt(sizeMatch[1], 10);
      headingSizes[level] = size;

      // Compare with higher level headings found so far
      for (let prev = 1; prev < level; prev++) {
        if (headingSizes[prev] && headingSizes[prev] <= size) {
          violations.push({
            type: 'general',
            severity: 'warning',
            message: `Visual hierarchy mismatch: h${level} size (${size}px) is >= h${prev} size (${headingSizes[prev]}px)`,
            line: i + 1,
          });
        }
      }
    }
  }
  return violations;
}

/**
 * Check for excessive visual noise (too many different colors or font sizes).
 */
export function checkVisualNoise(code: string): Violation[] {
  const violations: Violation[] = [];
  const colors = extractColors(code);
  const fontSizes = extractFontSizes(code);

  if (colors.length > 5) {
    violations.push({
      type: 'general',
      severity: 'warning',
      message: `High visual noise: ${colors.length} unique colors detected. Consider consolidating your palette.`,
    });
  }

  if (fontSizes.length > 4) {
    violations.push({
      type: 'general',
      severity: 'warning',
      message: `High visual noise: ${fontSizes.length} unique font sizes detected. Use a standardized typographic scale.`,
    });
  }

  return violations;
}

/**
 * Check if the code handles required data states (loading, empty, error).
 */
export function checkDataBinding(
  code: string,
  requirements: { requiresLoading?: boolean; requiresEmpty?: boolean; requiresError?: boolean }
): Violation[] {
  const violations: Violation[] = [];

  if (requirements.requiresLoading) {
    const hasLoading =
      /loading/i.test(code) ||
      /Skeleton/i.test(code) ||
      /Spinner/i.test(code) ||
      /isFetching/i.test(code);
    if (!hasLoading) {
      violations.push({
        type: 'general',
        severity: 'warning',
        message: 'Component lacks loading state handling (Spinner, Skeleton, or isLoading check)',
      });
    }
  }

  if (requirements.requiresEmpty) {
    const hasEmpty =
      /length\s*===?\s*0/i.test(code) ||
      /!data/i.test(code) ||
      /EmptyState/i.test(code) ||
      /No\s+results/i.test(code);
    if (!hasEmpty) {
      violations.push({
        type: 'general',
        severity: 'warning',
        message:
          'Component lacks empty state handling (length === 0 check or EmptyState component)',
      });
    }
  }

  if (requirements.requiresError) {
    const hasError =
      /error/i.test(code) ||
      /catch/i.test(code) ||
      (/Alert/i.test(code) && /variant="destructive"/i.test(code));
    if (!hasError) {
      violations.push({
        type: 'general',
        severity: 'warning',
        message: 'Component lacks error state handling (error check or Alert component)',
      });
    }
  }

  return violations;
}

/**
 * Run heuristic design audit.
 */
export function runDesignAudit(code: string): Violation[] {
  return [...checkTypographicHierarchy(code), ...checkVisualNoise(code)];
}
