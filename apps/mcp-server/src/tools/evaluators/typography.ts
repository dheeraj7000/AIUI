import {
  approvedValueSet,
  distinct,
  matchClasses,
  scoreFromIssues,
  type EvaluatorIssue,
  type EvaluatorResult,
} from './core';

/**
 * Project-aware typography evaluator. Scores how well a snippet's
 * type usage adheres to the project's type stack: font families, sizes,
 * weights, line-heights, and the implicit hierarchy (h1 > h2 > h3).
 *
 * The point of difference vs generic "audit" tools: this evaluator
 * compares against THIS project's defined tokens, so a font-size that's
 * fine for one project may be flagged for another.
 */
export function evaluateTypography(
  code: string,
  tokens: Record<string, Array<{ key: string; value: string }>>
): EvaluatorResult {
  const issues: EvaluatorIssue[] = [];
  const sizesObserved = new Set<string>();
  const fontsObserved = new Set<string>();
  const weightsObserved = new Set<string>();

  const fontSizeMatches = matchClasses(code, ['text-']);
  for (const m of fontSizeMatches) {
    // Only treat as font-size if the value parses as a length, OR if it's a
    // standard t-shirt label (xs/sm/base/lg/xl/2xl/etc.). Otherwise it's a
    // text color (text-primary, text-red-500), handled by the color evaluator.
    const isLengthLike = /^-?\d+(?:\.\d+)?(?:px|rem|em|%)$/.test(m.value);
    const isTShirt = /^(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(m.value);
    if (!isLengthLike && !isTShirt) continue;
    sizesObserved.add(m.value);

    if (m.isArbitrary) {
      issues.push({
        code: 'typography.scale.arbitrary',
        severity: 'warning',
        message: `\`text-[${m.value}]\` bypasses the project's font-size scale.`,
        suggestion: 'Promote this size into a font-size token via promote_pattern.',
      });
    }
  }

  for (const m of matchClasses(code, ['font-'])) {
    if (
      m.value === 'thin' ||
      m.value === 'extralight' ||
      m.value === 'light' ||
      m.value === 'normal' ||
      m.value === 'medium' ||
      m.value === 'semibold' ||
      m.value === 'bold' ||
      m.value === 'extrabold' ||
      m.value === 'black' ||
      /^[1-9]00$/.test(m.value)
    ) {
      weightsObserved.add(m.value);
    } else {
      fontsObserved.add(m.value);
    }
    if (m.isArbitrary) {
      issues.push({
        code: 'typography.font.arbitrary',
        severity: 'warning',
        message: `\`font-[${m.value}]\` bypasses the project's font stack.`,
        suggestion: 'Promote this font into a token via promote_pattern.',
      });
    }
  }

  // Inline style attributes — the LLM uses these surprisingly often
  for (const m of code.matchAll(/font-family\s*:\s*['"]?([^;'"]+)/gi)) {
    fontsObserved.add(m[1].trim());
  }
  for (const m of code.matchAll(/font-size\s*:\s*([^;]+)/gi)) {
    sizesObserved.add(m[1].trim());
  }

  // Hierarchy: extract heading tags + their applied classes
  const headingRe = /<(h[1-6])\b([^>]*)>/gi;
  const headingSizes: Array<{ level: number; size: string | null }> = [];
  for (const m of code.matchAll(headingRe)) {
    const level = parseInt(m[1].slice(1), 10);
    const attrs = m[2];
    const classMatch = attrs.match(/className=["']([^"']+)["']/);
    const sizeFromClass = classMatch
      ? classMatch[1].split(/\s+/).find((c) => c.startsWith('text-'))
      : undefined;
    headingSizes.push({ level, size: sizeFromClass?.replace(/^text-/, '') ?? null });
  }
  // For consecutive heading levels, the larger level should not have a smaller size
  for (let i = 0; i < headingSizes.length - 1; i++) {
    const a = headingSizes[i];
    const b = headingSizes[i + 1];
    if (a.size && b.size && a.level < b.level) {
      // a is more important, b is less — a's size should be >= b's
      const order = [
        'xs',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
        '8xl',
        '9xl',
      ];
      const ia = order.indexOf(a.size);
      const ib = order.indexOf(b.size);
      if (ia !== -1 && ib !== -1 && ia < ib) {
        issues.push({
          code: 'typography.hierarchy.inverted',
          severity: 'error',
          message: `<${a.size && '<h' + a.level}> uses size text-${a.size}, but the next-deeper <h${b.level}> uses larger text-${b.size}. Visual hierarchy is inverted.`,
          suggestion: 'Either swap the heading levels or use a larger size for the higher heading.',
        });
      }
    }
  }

  // Approved-value adherence
  const approvedSizes = new Set([
    ...approvedValueSet(tokens, 'font-size'),
    // Tailwind defaults are universally accepted as project-aligned unless
    // the project explicitly defines its own scale.
    ...(tokens['font-size']?.length
      ? []
      : ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']),
  ]);
  if (approvedSizes.size > 0) {
    for (const s of sizesObserved) {
      if (!approvedSizes.has(s.toLowerCase()) && !s.startsWith('[')) {
        issues.push({
          code: 'typography.scale.unknown-size',
          severity: 'info',
          message: `Font size \`${s}\` is not in the project's type scale.`,
        });
      }
    }
  }

  const approvedFonts = approvedValueSet(tokens, 'font');
  if (approvedFonts.size > 0) {
    for (const f of fontsObserved) {
      // Skip Tailwind family classes (sans/serif/mono) — those resolve to the
      // user's tailwind config which may be aliased to project tokens.
      if (['sans', 'serif', 'mono', 'display', 'body'].includes(f.toLowerCase())) continue;
      if (!approvedFonts.has(f.toLowerCase())) {
        issues.push({
          code: 'typography.font.unknown',
          severity: 'warning',
          message: `Font \`${f}\` isn't in the project's font tokens.`,
        });
      }
    }
  }

  // Diversity check — too many distinct sizes signals lack of scale discipline
  if (sizesObserved.size > 6) {
    issues.push({
      code: 'typography.scale.diversity',
      severity: 'warning',
      message: `${sizesObserved.size} distinct font sizes used. A typographic scale of 4–5 sizes is usually enough.`,
    });
  }
  if (fontsObserved.size > 3) {
    issues.push({
      code: 'typography.font.diversity',
      severity: 'warning',
      message: `${fontsObserved.size} distinct font families used. Two (display + body) usually suffices.`,
    });
  }

  const score = scoreFromIssues(issues);
  const summary = renderSummary(score, sizesObserved.size, fontsObserved.size, headingSizes.length);

  return {
    score,
    metrics: {
      uniqueSizes: sizesObserved.size,
      uniqueFonts: fontsObserved.size,
      uniqueWeights: weightsObserved.size,
      headings: headingSizes.length,
    },
    expected: {
      'font-size': (tokens['font-size'] ?? []).map((t) => `${t.key} = ${t.value}`),
      font: (tokens['font'] ?? []).map((t) => `${t.key} = ${t.value}`),
    },
    observed: {
      sizes: distinct([...sizesObserved]),
      fonts: distinct([...fontsObserved]),
      weights: distinct([...weightsObserved]),
    },
    issues,
    summary,
  };
}

function renderSummary(
  score: number,
  uniqueSizes: number,
  uniqueFonts: number,
  headings: number
): string {
  const grade =
    score >= 90
      ? 'on-brand'
      : score >= 70
        ? 'mostly aligned'
        : score >= 50
          ? 'drifting'
          : 'off-brand';
  return (
    `Typography ${grade} (${score}/100). ` +
    `${uniqueSizes} font size(s), ${uniqueFonts} font family(ies), ${headings} heading element(s).`
  );
}
