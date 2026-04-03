export interface ComplianceViolation {
  type: 'color' | 'font' | 'radius' | 'spacing' | 'shadow' | 'general';
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  value?: string;
  suggestion?: string;
}

export interface ComplianceResult {
  compliant: boolean;
  score: number;
  violations: ComplianceViolation[];
  checkedAt: string;
}

/**
 * Extract hex color values from code.
 */
function extractHexColors(code: string): Array<{ value: string; line: number }> {
  const results: Array<{ value: string; line: number }> = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(/#[0-9a-fA-F]{3,8}\b/g);
    if (matches) {
      for (const m of matches) {
        results.push({ value: m.toLowerCase(), line: i + 1 });
      }
    }
  }
  return results;
}

/**
 * Extract font family references from code.
 */
function extractFontFamilies(code: string): Array<{ value: string; line: number }> {
  const results: Array<{ value: string; line: number }> = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(/font-(?:family|sans|serif|mono)[\s:="']*([^"';,})\]]+)/g);
    if (matches) {
      for (const m of matches) {
        const name = m.replace(/font-(?:family|sans|serif|mono)[\s:="']*/, '').trim();
        if (name) results.push({ value: name, line: i + 1 });
      }
    }
  }
  return results;
}

/**
 * Check generated code for compliance against approved tokens.
 */
export function checkTokenCompliance(
  code: string,
  approvedTokens: Array<{ tokenKey: string; tokenValue: string; tokenType: string }>
): ComplianceResult {
  const violations: ComplianceViolation[] = [];

  const approvedColors = new Set(
    approvedTokens.filter((t) => t.tokenType === 'color').map((t) => t.tokenValue.toLowerCase())
  );

  const approvedFonts = new Set(
    approvedTokens.filter((t) => t.tokenType === 'font').map((t) => t.tokenValue.toLowerCase())
  );

  // Check colors
  const usedColors = extractHexColors(code);
  for (const { value, line } of usedColors) {
    if (!approvedColors.has(value)) {
      violations.push({
        type: 'color',
        severity: 'warning',
        message: `Unauthorized color "${value}" at line ${line}`,
        line,
        value,
        suggestion: `Replace with an approved color token value`,
      });
    }
  }

  // Check fonts
  const usedFonts = extractFontFamilies(code);
  for (const { value, line } of usedFonts) {
    if (!approvedFonts.has(value.toLowerCase())) {
      violations.push({
        type: 'font',
        severity: 'warning',
        message: `Unauthorized font "${value}" at line ${line}`,
        line,
        value,
        suggestion: `Replace with an approved font from the design tokens`,
      });
    }
  }

  const errorCount = violations.filter((v) => v.severity === 'error').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    compliant: violations.length === 0,
    score,
    violations,
    checkedAt: new Date().toISOString(),
  };
}
