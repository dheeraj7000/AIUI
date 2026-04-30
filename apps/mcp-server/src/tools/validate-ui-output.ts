import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens, designProfiles, computeTokensHash } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';
import {
  extractColors,
  extractTailwindViolations,
  extractFonts,
  extractSpacingValues,
  extractBorderRadiusValues,
  extractFontSizes,
  extractZIndexValues,
  extractOpacityValues,
  extractBorderWidthValues,
  checkImgAlt,
  checkButtonLabels,
  checkFormLabels,
  checkHeadingOrder,
  checkAriaRoles,
  checkColorContrast,
  CSS_NAMED_COLORS,
  TAILWIND_PALETTE,
  type Violation,
} from './detectors';

// Re-export detectors for back-compat with consumers that import from here.
export {
  extractColors,
  extractTailwindViolations,
  extractFonts,
  extractSpacingValues,
  extractBorderRadiusValues,
  extractFontSizes,
  extractZIndexValues,
  extractOpacityValues,
  extractBorderWidthValues,
  CSS_NAMED_COLORS,
  TAILWIND_PALETTE,
};
export type { Violation };

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerValidateUiOutput(server: AiuiMcpServer) {
  server.registerTool(
    'validate_ui_output',
    '**Call this AFTER you generate ANY UI code, BEFORE returning the code to the user.** ' +
      "Validates the code against the project's approved design tokens — colors, fonts, spacing, radii, font sizes, z-index, opacity, border widths — and runs accessibility checks (alt text, button labels, heading order, contrast). " +
      'If the response includes any violations, your next call MUST be `fix_compliance_issues` with those violations to auto-correct them. ' +
      'Returns a compliance score (0–100) and a `memoryFresh` boolean — if false, also call `sync_design_memory` to refresh the local .aiui/ files.',
    {
      projectId: z.string().uuid().describe('The project ID to validate against'),
      code: z.string().describe('The generated UI code to validate'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const code = args.code as string;

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

      const authCtx = getContext();
      if (authCtx?.organizationId && project?.organizationId !== authCtx.organizationId) {
        throw new NotFoundError('Project', projectId);
      }

      if (!project) {
        throw new NotFoundError('Project', projectId);
      }

      const violations: Violation[] = [];

      const tokens = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenValue: styleTokens.tokenValue,
          tokenType: styleTokens.tokenType,
        })
        .from(styleTokens)
        .where(eq(styleTokens.projectId, project.id));

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

      // -----------------------------------------------------------------------
      // Token checks — only run when approved values exist for that type
      // -----------------------------------------------------------------------

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

      const approvedTailwind = new Set<string>();
      for (const v of approvedColors) approvedTailwind.add(v);
      const tailwindViolations = extractTailwindViolations(code, approvedTailwind);
      for (const tv of tailwindViolations) {
        violations.push({
          type: 'color',
          severity: 'warning',
          message:
            tv.kind === 'utility'
              ? `Tailwind utility "${tv.value}" uses a hardcoded palette color not in the approved token set`
              : `Tailwind arbitrary value "${tv.value}" bypasses the design token system`,
          line: tv.line,
        });
      }

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
        })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, projectId))
        .limit(1);

      if (profile) {
        const currentTokensHash = await computeTokensHash(db, project.id);
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
