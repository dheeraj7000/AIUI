import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

export interface Pattern {
  value: string;
  type: 'color' | 'spacing' | 'radius' | 'other';
  count: number;
  files: string[];
}

/**
 * Scan project files for repetitive arbitrary Tailwind values or hardcoded styles.
 */
export async function detectPatterns(cwd: string): Promise<Pattern[]> {
  const files = await glob('src/**/*.{tsx,jsx,ts,js,css,html}', { cwd, absolute: true });
  const patternCounts: Record<
    string,
    { count: number; files: Set<string>; type: Pattern['type'] }
  > = {};

  const arbRe = /(?<![A-Za-z0-9_-])[a-z][a-z0-9-]*-\[([^\]\s]+)\]/gi;
  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Detect arbitrary Tailwind values
    let am: RegExpExecArray | null;
    while ((am = arbRe.exec(content)) !== null) {
      const whole = am[0];
      const value = am[1];

      let type: Pattern['type'] = 'other';
      if (/^#[0-9a-f]{3,8}$/i.test(value)) type = 'color';
      else if (/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value)) type = 'spacing';

      if (!patternCounts[whole]) {
        patternCounts[whole] = { count: 0, files: new Set(), type };
      }
      patternCounts[whole].count++;
      patternCounts[whole].files.add(path.relative(cwd, filePath));
    }

    // Detect hardcoded hex colors in CSS/Style attributes
    let hm: RegExpExecArray | null;
    while ((hm = hexRe.exec(content)) !== null) {
      const hex = hm[0].toLowerCase();
      if (!patternCounts[hex]) {
        patternCounts[hex] = { count: 0, files: new Set(), type: 'color' };
      }
      patternCounts[hex].count++;
      patternCounts[hex].files.add(path.relative(cwd, filePath));
    }
  }

  return Object.entries(patternCounts)
    .filter((entry) => entry[1].count >= 3)
    .map(([value, data]) => ({
      value,
      type: data.type,
      count: data.count,
      files: Array.from(data.files),
    }))
    .sort((a, b) => b.count - a.count);
}
