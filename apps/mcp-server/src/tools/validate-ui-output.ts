import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens, designProfiles, computeTokensHash } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';

interface Violation {
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
// Token extractors
// ---------------------------------------------------------------------------

/**
 * Extract color hex values from code string.
 */
function extractColors(code: string): string[] {
  const matches = code.match(/#[0-9a-fA-F]{3,8}\b/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract font family references from code.
 */
function extractFonts(code: string): string[] {
  const matches = code.match(/font-(?:family|sans|serif|mono)[\s:]*["']?([^"';,}]+)/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract hardcoded spacing values (px/rem) from margin, padding, gap declarations.
 * Skips CSS custom property references (var(--...)).
 */
function extractSpacingValues(code: string): string[] {
  const pattern =
    /(?:margin|padding|gap)(?:-(?:top|right|bottom|left|inline|block))?[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    // Pull out individual px/rem values, skip var(--...) references
    const nums = raw.match(/(?<!\w)(\d+(?:\.\d+)?(?:px|rem))\b/gi);
    if (nums) {
      for (const n of nums) {
        if (!raw.includes('var(')) {
          values.add(n.toLowerCase());
        }
      }
    }
  }
  return [...values];
}

/**
 * Extract hardcoded border-radius values.
 */
function extractBorderRadiusValues(code: string): string[] {
  const pattern = /border-radius[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(?<!\w)(\d+(?:\.\d+)?(?:px|rem|%))\b/gi);
    if (nums) {
      for (const n of nums) values.add(n.toLowerCase());
    }
  }
  return [...values];
}

/**
 * Extract hardcoded font-size values.
 */
function extractFontSizes(code: string): string[] {
  const pattern = /font-size[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(?<!\w)(\d+(?:\.\d+)?(?:px|rem|em))\b/gi);
    if (nums) {
      for (const n of nums) values.add(n.toLowerCase());
    }
  }
  return [...values];
}

/**
 * Extract hardcoded z-index values.
 */
function extractZIndexValues(code: string): string[] {
  const pattern = /z-index[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(-?\d+)/g);
    if (nums) {
      for (const n of nums) values.add(n);
    }
  }
  return [...values];
}

/**
 * Extract hardcoded opacity values.
 */
function extractOpacityValues(code: string): string[] {
  const pattern = /opacity[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(\d+(?:\.\d+)?)/g);
    if (nums) {
      for (const n of nums) values.add(n);
    }
  }
  return [...values];
}

/**
 * Extract hardcoded border-width values.
 */
function extractBorderWidthValues(code: string): string[] {
  const pattern = /border(?:-(?:top|right|bottom|left))?-width[\s]*:[\s]*([^;{}]+)/gi;
  const values: Set<string> = new Set();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const nums = raw.match(/(?<!\w)(\d+(?:\.\d+)?(?:px|rem))\b/gi);
    if (nums) {
      for (const n of nums) values.add(n.toLowerCase());
    }
  }
  return [...values];
}

// ---------------------------------------------------------------------------
// Accessibility checks (warning-level)
// ---------------------------------------------------------------------------

/**
 * Find <img> tags missing an alt attribute.
 */
function checkImgAlt(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match <img that is NOT self-closing before we can check for alt
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

/**
 * Find <button> / <Button> tags without text content or aria-label.
 */
function checkButtonLabels(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<[Bb]utton\b/i.test(line)) {
      const hasAriaLabel = /aria-label\s*=/i.test(line);
      // Self-closing button with no aria-label is a violation
      const isSelfClosing = /\/\s*>/.test(line);
      // Empty button: <button></button> or <Button></Button>
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

/**
 * Find <input> without associated label or aria-label.
 */
function checkFormLabels(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<input\b/i.test(line)) {
      const hasAriaLabel = /aria-label\s*=/i.test(line);
      const hasAriaLabelledBy = /aria-labelledby\s*=/i.test(line);
      const hasId = /\bid\s*=/i.test(line);
      // Check if there's a <label> on the preceding line referencing this input
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

/**
 * Check heading order (h1-h6) doesn't skip levels.
 */
function checkHeadingOrder(code: string): Violation[] {
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

/**
 * Find interactive elements (onClick) without a role attribute.
 */
function checkAriaRoles(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/onClick/i.test(line)) {
      // Skip if it's on an inherently interactive element
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

/**
 * Compute relative luminance from an sRGB hex color.
 */
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

/**
 * If foreground/background hex color pairs are detected, check WCAG 4.5:1 ratio.
 */
function checkColorContrast(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for color: #xxx and background(-color): #xxx on the same or adjacent lines
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
            message: `Low color contrast ratio (${ratio.toFixed(2)}:1) between ${fgMatch[1]} and ${bgMatch[1]} — WCAG AA requires 4.5:1`,
            line: i + 1,
          });
        }
      }
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerValidateUiOutput(server: AiuiMcpServer) {
  server.registerTool(
    'validate_ui_output',
    "Check generated UI code for compliance against the project's design system. Validates colors, fonts, spacing, radii, font sizes, z-index, opacity, border widths, and accessibility.",
    {
      projectId: z.string().uuid().describe('The project ID to validate against'),
      code: z.string().describe('The generated UI code to validate'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const code = args.code as string;

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

      // Verify project org matches auth context
      const authCtx = getContext();
      if (authCtx?.organizationId && project?.organizationId !== authCtx.organizationId) {
        throw new NotFoundError('Project', projectId);
      }

      if (!project || !project.activeStylePackId) {
        throw new NotFoundError('Project', projectId);
      }

      // Fetch approved tokens
      const tokens = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenValue: styleTokens.tokenValue,
          tokenType: styleTokens.tokenType,
        })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, project.activeStylePackId));

      // Build approved sets per token type
      const approvedColors = new Set(
        tokens.filter((t) => t.tokenType === 'color').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedFonts = new Set(
        tokens.filter((t) => t.tokenType === 'font').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedSpacing = new Set(
        tokens.filter((t) => t.tokenType === 'spacing').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedRadius = new Set(
        tokens.filter((t) => t.tokenType === 'radius').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedFontSizes = new Set(
        tokens.filter((t) => t.tokenType === 'font-size').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedZIndex = new Set(
        tokens.filter((t) => t.tokenType === 'z-index').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedOpacity = new Set(
        tokens.filter((t) => t.tokenType === 'opacity').map((t) => t.tokenValue.toLowerCase())
      );

      const approvedBorderWidth = new Set(
        tokens.filter((t) => t.tokenType === 'border-width').map((t) => t.tokenValue.toLowerCase())
      );

      const violations: Violation[] = [];

      // -----------------------------------------------------------------------
      // Token checks — only run when approved values exist for that type
      // -----------------------------------------------------------------------

      // Check colors
      const usedColors = extractColors(code);
      if (approvedColors.size > 0) {
        for (const color of usedColors) {
          if (!approvedColors.has(color.toLowerCase())) {
            violations.push({
              type: 'color',
              severity: 'warning',
              message: `Color "${color}" is not in the approved token set`,
            });
          }
        }
      }

      // Check fonts
      const usedFonts = extractFonts(code);
      if (approvedFonts.size > 0) {
        for (const font of usedFonts) {
          const fontName = font.replace(/font-(?:family|sans|serif|mono)[\s:]*["']?/, '').trim();
          if (fontName && !approvedFonts.has(fontName.toLowerCase())) {
            violations.push({
              type: 'font',
              severity: 'warning',
              message: `Font reference "${fontName}" is not in the approved token set`,
            });
          }
        }
      }

      // Check spacing
      const usedSpacing = extractSpacingValues(code);
      if (approvedSpacing.size > 0) {
        for (const val of usedSpacing) {
          if (!approvedSpacing.has(val)) {
            violations.push({
              type: 'spacing',
              severity: 'warning',
              message: `Spacing value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // Check border-radius
      const usedRadius = extractBorderRadiusValues(code);
      if (approvedRadius.size > 0) {
        for (const val of usedRadius) {
          if (!approvedRadius.has(val)) {
            violations.push({
              type: 'radius',
              severity: 'warning',
              message: `Border-radius value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // Check font-size
      const usedFontSizes = extractFontSizes(code);
      if (approvedFontSizes.size > 0) {
        for (const val of usedFontSizes) {
          if (!approvedFontSizes.has(val)) {
            violations.push({
              type: 'font-size',
              severity: 'warning',
              message: `Font-size value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // Check z-index
      const usedZIndex = extractZIndexValues(code);
      if (approvedZIndex.size > 0) {
        for (const val of usedZIndex) {
          if (!approvedZIndex.has(val)) {
            violations.push({
              type: 'z-index',
              severity: 'warning',
              message: `Z-index value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // Check opacity
      const usedOpacity = extractOpacityValues(code);
      if (approvedOpacity.size > 0) {
        for (const val of usedOpacity) {
          if (!approvedOpacity.has(val)) {
            violations.push({
              type: 'opacity',
              severity: 'warning',
              message: `Opacity value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // Check border-width
      const usedBorderWidth = extractBorderWidthValues(code);
      if (approvedBorderWidth.size > 0) {
        for (const val of usedBorderWidth) {
          if (!approvedBorderWidth.has(val)) {
            violations.push({
              type: 'border-width',
              severity: 'warning',
              message: `Border-width value "${val}" is not in the approved token set`,
            });
          }
        }
      }

      // -----------------------------------------------------------------------
      // Accessibility checks (always run)
      // -----------------------------------------------------------------------
      const a11yViolations: Violation[] = [
        ...checkImgAlt(code),
        ...checkButtonLabels(code),
        ...checkFormLabels(code),
        ...checkHeadingOrder(code),
        ...checkAriaRoles(code),
        ...checkColorContrast(code),
      ];

      violations.push(...a11yViolations);

      // -----------------------------------------------------------------------
      // Scoring
      // -----------------------------------------------------------------------
      const errorCount = violations.filter((v) => v.severity === 'error').length;
      const warningCount = violations.filter(
        (v) => v.severity === 'warning' && v.type !== 'accessibility'
      ).length;
      const a11yCount = a11yViolations.length;

      const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5 - a11yCount * 3);

      // Check if the project's design profile is stale
      let memoryFresh = true;
      const [profile] = await db
        .select({
          tokensHash: designProfiles.tokensHash,
          compilationValid: designProfiles.compilationValid,
          stylePackId: designProfiles.stylePackId,
        })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, projectId))
        .limit(1);

      if (profile?.stylePackId) {
        const currentTokensHash = await computeTokensHash(db, profile.stylePackId);
        if (
          !profile.compilationValid ||
          (profile.tokensHash && profile.tokensHash !== currentTokensHash)
        ) {
          memoryFresh = false;
        }
      }

      const stalenessWarning = memoryFresh
        ? undefined
        : 'Design memory may be outdated. Consider re-syncing.';

      return {
        compliant: violations.length === 0,
        score,
        violations,
        memoryFresh,
        ...(stalenessWarning ? { stalenessWarning } : {}),
        summary: {
          errors: errorCount,
          warnings: warningCount,
          a11yIssues: a11yCount,
          checkedColors: usedColors.length,
          checkedFonts: usedFonts.length,
          checkedSpacing: usedSpacing.length,
          checkedRadius: usedRadius.length,
          checkedFontSizes: usedFontSizes.length,
          checkedZIndex: usedZIndex.length,
          checkedOpacity: usedOpacity.length,
          checkedBorderWidths: usedBorderWidth.length,
        },
      };
    }
  );
}
