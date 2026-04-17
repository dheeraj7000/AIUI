import type { Violation } from './validate-ui-output';
import type { AntiPatternViolation as ExternalAntiPatternViolation } from './anti-patterns';

/**
 * A qualitative critique finding from a synthetic user persona.
 * These are rule-based heuristics — NOT LLM calls — that map patterns already
 * observable in the source code to prose findings from a named user viewpoint.
 */
export interface PersonaFinding {
  persona: string;
  finding: string;
  severity: 'info' | 'warning' | 'error';
  evidence: string[];
}

/**
 * Re-export of the validator's AntiPatternViolation shape for callers that
 * want to compose with persona critique without importing from anti-patterns
 * directly.
 */
export type AntiPatternViolation = ExternalAntiPatternViolation;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function countMatches(code: string, re: RegExp): number {
  const m = code.match(re);
  return m ? m.length : 0;
}

function collectMatches(code: string, re: RegExp, limit = 5): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  // ensure global
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
  const pattern = new RegExp(re.source, flags);
  while ((m = pattern.exec(code)) !== null && out.length < limit) {
    out.push(m[0]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Persona: First-time user
// ---------------------------------------------------------------------------

function firstTimeUser(code: string): PersonaFinding | null {
  const evidence: string[] = [];
  const reasons: string[] = [];

  // >2 primary CTAs — heuristic: className contains "primary" or common btn-primary tokens
  const primaryCtas = collectMatches(
    code,
    /<(?:button|a|Button|Link)\b[^>]*(?:variant=["']primary["']|class(?:Name)?=["'][^"']*\b(?:btn-primary|primary|cta-primary)\b[^"']*["'])[^>]*>/gi,
    10
  );
  if (primaryCtas.length > 2) {
    reasons.push(`Saw ${primaryCtas.length} primary-styled CTAs; unclear which to click first.`);
    evidence.push(...primaryCtas.slice(0, 3));
  }

  // Missing h1 / no visible page label
  const hasH1 = /<h1\b/i.test(code);
  if (!hasH1) {
    reasons.push('No <h1> found — I cannot tell what page I am on.');
    evidence.push('(no <h1> element detected)');
  }

  // Form inputs without label within 200 chars
  const inputRe = /<input\b/gi;
  let im: RegExpExecArray | null;
  const orphanInputs: string[] = [];
  while ((im = inputRe.exec(code)) !== null) {
    const start = Math.max(0, im.index - 200);
    const window = code.slice(start, im.index + 200);
    const hasNearbyLabel = /<label\b/i.test(window);
    const hasAriaLabel = /aria-label\s*=/i.test(code.slice(im.index, im.index + 200));
    if (!hasNearbyLabel && !hasAriaLabel) {
      orphanInputs.push(code.slice(im.index, Math.min(code.length, im.index + 80)));
    }
    if (orphanInputs.length >= 3) break;
  }
  if (orphanInputs.length > 0) {
    reasons.push(
      `${orphanInputs.length} input field(s) lack a nearby <label>; first-time users won't know what to type.`
    );
    evidence.push(...orphanInputs);
  }

  if (reasons.length === 0) return null;
  return {
    persona: 'First-time user',
    finding: reasons.join(' '),
    severity: reasons.length >= 2 ? 'warning' : 'info',
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Persona: Speed reader
// ---------------------------------------------------------------------------

function speedReader(code: string): PersonaFinding | null {
  const evidence: string[] = [];
  const reasons: string[] = [];

  // Walls of text: <p> with >400 chars of content
  const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let pm: RegExpExecArray | null;
  const walls: string[] = [];
  while ((pm = pRe.exec(code)) !== null) {
    const inner = pm[1].replace(/<[^>]+>/g, '').trim();
    if (inner.length > 400) {
      walls.push(inner.slice(0, 80) + '...');
    }
    if (walls.length >= 3) break;
  }
  if (walls.length > 0) {
    reasons.push(
      `Found ${walls.length} paragraph(s) over 400 chars — I'd bounce before finishing.`
    );
    evidence.push(...walls);
  }

  // No h2/h3 hierarchy when there is an h1 and long body text
  const hasH1 = /<h1\b/i.test(code);
  const hasSubheads = /<h[23]\b/i.test(code);
  const bodyLen = code.replace(/<[^>]+>/g, '').length;
  if (hasH1 && !hasSubheads && bodyLen > 600) {
    reasons.push(
      'No <h2>/<h3> subheadings to scan by; the content reads as one undifferentiated block.'
    );
    evidence.push('(h1 present, no h2/h3 found)');
  }

  // >5 similar-weight sibling items without grouping (heuristic: 6+ consecutive <li> not inside nav/section/ul-grouping with a heading)
  const liCount = countMatches(code, /<li\b/gi);
  const groupingHeadings = countMatches(code, /<(?:h[1-6])\b/gi);
  if (liCount > 5 && groupingHeadings < 2) {
    reasons.push(
      `${liCount} list items with only ${groupingHeadings} heading(s) — no way to skim into sections.`
    );
    evidence.push(`${liCount} <li> elements`);
  }

  if (reasons.length === 0) return null;
  return {
    persona: 'Speed reader',
    finding: reasons.join(' '),
    severity: walls.length > 0 ? 'warning' : 'info',
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Persona: Keyboard user
// ---------------------------------------------------------------------------

function keyboardUser(code: string): PersonaFinding | null {
  const evidence: string[] = [];
  const reasons: string[] = [];

  // onClick on non-button, non-native-interactive elements
  const onClickRe = /<(\w+)\b[^>]*\bonClick\s*=/gi;
  let cm: RegExpExecArray | null;
  const badClicks: string[] = [];
  while ((cm = onClickRe.exec(code)) !== null) {
    const tag = cm[1].toLowerCase();
    if (['button', 'a', 'input', 'select', 'textarea', 'details', 'summary'].includes(tag))
      continue;
    // Capitalized components — could be a Button wrapper; skip to reduce false positives
    if (/^[A-Z]/.test(cm[1])) continue;
    badClicks.push(code.slice(cm.index, Math.min(code.length, cm.index + 80)));
    if (badClicks.length >= 3) break;
  }
  if (badClicks.length > 0) {
    reasons.push(
      `${badClicks.length} onClick handler(s) on non-button elements — I can't reach these with Tab.`
    );
    evidence.push(...badClicks);
  }

  // Missing role= on interactive divs (div with onClick and no role)
  const divClickRe = /<div\b[^>]*\bonClick[^>]*>/gi;
  const divClicks = collectMatches(code, divClickRe, 5);
  const divClicksNoRole = divClicks.filter((d) => !/\brole\s*=/i.test(d));
  if (divClicksNoRole.length > 0) {
    reasons.push(`${divClicksNoRole.length} clickable <div>(s) without role="button".`);
    evidence.push(...divClicksNoRole.slice(0, 2));
  }

  // outline:none / outline-none without visible focus ring replacement
  const hasOutlineNone = /outline\s*:\s*none/i.test(code) || /\boutline-none\b/.test(code);
  const hasFocusRing =
    /focus-visible:/i.test(code) ||
    /focus:(?:ring|outline|border|shadow)/i.test(code) ||
    /:focus\b[^{]*\{[^}]*(?:outline|box-shadow|border)/i.test(code);
  if (hasOutlineNone && !hasFocusRing) {
    reasons.push('Outline removed with no focus-visible replacement — I lose track of where I am.');
    evidence.push('outline: none / outline-none (no focus ring replacement)');
  }

  // tabindex misuse: tabIndex > 0 (positive tabindex is almost always wrong)
  const tabRe = /tab[iI]ndex\s*=\s*["'{]?\s*(-?\d+)/g;
  let tm: RegExpExecArray | null;
  const badTabs: string[] = [];
  while ((tm = tabRe.exec(code)) !== null) {
    const n = parseInt(tm[1], 10);
    if (n > 0) badTabs.push(tm[0]);
    if (badTabs.length >= 3) break;
  }
  if (badTabs.length > 0) {
    reasons.push(`Positive tabindex values detected — these distort natural tab order.`);
    evidence.push(...badTabs);
  }

  if (reasons.length === 0) return null;
  return {
    persona: 'Keyboard user',
    finding: reasons.join(' '),
    severity: badClicks.length > 0 || hasOutlineNone ? 'warning' : 'info',
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Persona: Accessibility need
// ---------------------------------------------------------------------------

function accessibilityNeed(code: string, violations: Violation[]): PersonaFinding | null {
  const evidence: string[] = [];
  const reasons: string[] = [];

  // Low-contrast: reuse any existing contrast violations
  const contrastViolations = violations.filter(
    (v) => v.type === 'accessibility' && /contrast/i.test(v.message)
  );
  if (contrastViolations.length > 0) {
    reasons.push('Text/background pairs fall below WCAG 4.5:1; low-vision users may miss content.');
    evidence.push(...contrastViolations.slice(0, 2).map((v) => v.message));
  }

  // Missing alt on img
  const imgRe = /<img\b[^>]*>/gi;
  const imgs = collectMatches(code, imgRe, 10);
  const noAltImgs = imgs.filter((i) => !/\balt\s*=/i.test(i));
  if (noAltImgs.length > 0) {
    reasons.push(`${noAltImgs.length} <img> tag(s) without alt text — screen readers skip them.`);
    evidence.push(...noAltImgs.slice(0, 2));
  }

  // Icon-only button: <button ...> <svg .../> </button> with no text and no aria-label
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let bm: RegExpExecArray | null;
  const iconOnly: string[] = [];
  while ((bm = btnRe.exec(code)) !== null) {
    const attrs = bm[1];
    const inner = bm[2];
    const hasAriaLabel = /aria-label\s*=/i.test(attrs);
    const stripped = inner
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    const hasSvg = /<svg\b/i.test(inner);
    if (hasSvg && !hasAriaLabel && stripped.length === 0) {
      iconOnly.push(bm[0].slice(0, 80));
    }
    if (iconOnly.length >= 3) break;
  }
  if (iconOnly.length > 0) {
    reasons.push(
      `${iconOnly.length} icon-only <button>(s) without aria-label — screen readers announce "button" with no purpose.`
    );
    evidence.push(...iconOnly);
  }

  // Color-only signals: phrases like "red items", "green ones", "the blue button" in copy
  const colorWords =
    /(?:red|green|blue|yellow|orange|purple)\s+(?:items?|ones?|buttons?|rows?|entries?|links?)/gi;
  const colorOnly = collectMatches(code, colorWords, 3);
  if (colorOnly.length > 0) {
    reasons.push(
      'Copy refers to items by color alone ("red items", etc.) — colorblind users lose the signal.'
    );
    evidence.push(...colorOnly);
  }

  if (reasons.length === 0) return null;
  return {
    persona: 'Accessibility need',
    finding: reasons.join(' '),
    severity: contrastViolations.length > 0 || noAltImgs.length > 0 ? 'warning' : 'info',
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Run all persona heuristics over `code` and return any findings.
 * Personas with no triggered rules are omitted from the result.
 */
export function critiqueByPersonas(code: string, violations: Violation[] = []): PersonaFinding[] {
  const findings: PersonaFinding[] = [];
  const ft = firstTimeUser(code);
  if (ft) findings.push(ft);
  const sr = speedReader(code);
  if (sr) findings.push(sr);
  const ku = keyboardUser(code);
  if (ku) findings.push(ku);
  const an = accessibilityNeed(code, violations);
  if (an) findings.push(an);
  return findings;
}
