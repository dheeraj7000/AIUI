/**
 * Metrics: parse a single generated UI file and compute design-quality stats.
 *
 * Reuses the regex extractors that ship inside the MCP server's detectors,
 * so the benchmark scoring is calibrated against the same compliance rules
 * the product enforces at runtime.
 */
import * as fs from 'node:fs';
import {
  extractColors,
  extractFonts,
  extractSpacingValues,
  extractBorderRadiusValues,
  extractFontSizes,
  extractTailwindViolations,
  checkImgAlt,
  checkButtonLabels,
  checkFormLabels,
  checkHeadingOrder,
  checkAriaRoles,
} from '../../apps/mcp-server/src/tools/detectors';

export interface FileMetrics {
  path: string;
  loc: number;
  uniqueColors: number;
  uniqueFonts: number;
  uniqueSpacing: number;
  uniqueRadii: number;
  uniqueFontSizes: number;
  arbitraryValueCount: number;
  hardcodedHexCount: number;
  a11yIssues: number;
  /** 0–100; subtracts for noise + a11y, rewards token reuse. */
  qualityScore: number;
}

export function measureFile(filePath: string): FileMetrics {
  const code = fs.readFileSync(filePath, 'utf-8');
  const loc = code.split('\n').length;

  const colors = extractColors(code);
  const fonts = extractFonts(code);
  const spacing = extractSpacingValues(code);
  const radii = extractBorderRadiusValues(code);
  const fontSizes = extractFontSizes(code);

  // Pretend nothing is in the approved set so we count everything as a violation.
  // The point of the benchmark is to count the agent's hardcoded usage, not to
  // assert against a specific token set — that comes from the project's actual
  // tokens during validate_ui_output, not here.
  const tailwindViolations = extractTailwindViolations(code, new Set());
  const arbitraryValueCount = tailwindViolations.filter((v) => v.kind === 'arbitrary').length;

  const hardcodedHexCount = (code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length;

  const a11yIssues = [
    ...checkImgAlt(code),
    ...checkButtonLabels(code),
    ...checkFormLabels(code),
    ...checkHeadingOrder(code),
    ...checkAriaRoles(code),
  ].length;

  // Score: start at 100, subtract for noise. Tuned by inspection — the goal
  // is a number that's monotonic in "less hardcoded chaos."
  let score = 100;
  score -= Math.min(40, arbitraryValueCount * 4); // bypassing the design system is the worst signal
  score -= Math.min(20, hardcodedHexCount * 2);
  score -= Math.min(10, Math.max(0, colors.length - 4) * 2); // > 4 unique colors costs
  score -= Math.min(10, Math.max(0, fontSizes.length - 4) * 2);
  score -= Math.min(20, a11yIssues * 5);

  return {
    path: filePath,
    loc,
    uniqueColors: colors.length,
    uniqueFonts: fonts.length,
    uniqueSpacing: spacing.length,
    uniqueRadii: radii.length,
    uniqueFontSizes: fontSizes.length,
    arbitraryValueCount,
    hardcodedHexCount,
    a11yIssues,
    qualityScore: Math.max(0, score),
  };
}

// CLI entry point: `tsx lib/metrics.ts path/to/file.tsx`
if (import.meta.url === `file://${process.argv[1]}`) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: tsx lib/metrics.ts <file.tsx>');
    process.exit(1);
  }
  const m = measureFile(target);
  console.log(JSON.stringify(m, null, 2));
}
