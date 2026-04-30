/**
 * Heuristic signals from a UI snippet that a persona-aware critique can
 * reason over. Intentionally NOT a critique itself — that's the LLM's job
 * once it has these signals + the project's shape data.
 *
 * The signals fall into four buckets:
 *  - Cognitive load    : how much is on the screen / how many decisions
 *  - Hierarchy         : what jumps out, what competes
 *  - Tone              : formality, warmth, density
 *  - Friction & trust  : form weight, gates, social proof
 */

export interface PersonaSignals {
  /** Cognitive load proxies. */
  interactiveElements: number;
  decisionPoints: number;
  wordCount: number;
  paragraphCount: number;
  /** Hierarchy. */
  headings: Array<{ level: number; text: string }>;
  primaryCtas: string[];
  competingCtas: number;
  /** Friction. */
  requiredFormFields: number;
  totalFormFields: number;
  modalsAndOverlays: number;
  /** Trust signals detected by keyword presence. */
  trustElements: string[];
  /** Tone signals. */
  formalIndicators: number;
  casualIndicators: number;
  /** Density tier estimate from spacing usage. */
  density: 'compact' | 'default' | 'airy';
}

const STRIP_TAGS_RE = /<[^>]+>/g;
const SCRIPT_BLOCK_RE = /<script[\s\S]*?<\/script>/gi;
const STYLE_BLOCK_RE = /<style[\s\S]*?<\/style>/gi;
const CLASS_ATTR_RE = /\b(?:className|class)=["'][^"']*["']/g;
const JSX_EXPR_RE = /\{[^}]*\}/g;

function extractVisibleText(code: string): string {
  return code
    .replace(SCRIPT_BLOCK_RE, ' ')
    .replace(STYLE_BLOCK_RE, ' ')
    .replace(CLASS_ATTR_RE, ' ')
    .replace(/\b(?:href|src|key|id|aria-[a-z-]+|data-[a-z-]+)=["'][^"']*["']/g, ' ')
    .replace(JSX_EXPR_RE, ' ')
    .replace(STRIP_TAGS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(code: string, re: RegExp): number {
  return (code.match(re) ?? []).length;
}

function extractHeadings(code: string): Array<{ level: number; text: string }> {
  const out: Array<{ level: number; text: string }> = [];
  const re = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const m of code.matchAll(re)) {
    const level = parseInt(m[1].slice(1), 10);
    const text = extractVisibleText(m[2]).slice(0, 120);
    if (text) out.push({ level, text });
  }
  return out;
}

function extractCtas(code: string): { primary: string[]; total: number } {
  // CTAs are <button> and <a> with prominent role / href / className signals.
  const buttons = [...code.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)];
  const links = [...code.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)];
  const all: Array<{ text: string; isPrimary: boolean }> = [];

  for (const m of buttons) {
    const text = extractVisibleText(m[1]).slice(0, 80);
    if (!text) continue;
    const tag = m[0];
    const isPrimary =
      /\b(?:btn-(?:primary|ink)|bg-(?:primary|ink|accent|brand)|cta)\b/.test(tag) ||
      /^(?:Get started|Sign up|Start free|Try it|Continue|Subscribe|Buy|Pay|Upgrade)/i.test(text);
    all.push({ text, isPrimary });
  }
  for (const m of links) {
    const text = extractVisibleText(m[1]).slice(0, 80);
    if (!text || text.length < 3) continue;
    const tag = m[0];
    const isPrimary =
      /\b(?:btn-(?:primary|ink)|bg-(?:primary|ink|accent|brand)|cta)\b/.test(tag) ||
      /^(?:Get started|Sign up|Start free|Try it|Continue|Subscribe|Buy|Pay|Upgrade)/i.test(text);
    all.push({ text, isPrimary });
  }

  const primary = all.filter((c) => c.isPrimary).map((c) => c.text);
  return { primary, total: all.length };
}

function detectTrust(code: string): string[] {
  const text = extractVisibleText(code).toLowerCase();
  const found: string[] = [];
  if (
    /testimonial|love|customer|"|‟|—/i.test(text) &&
    /[a-z]+\s+[a-z]+\s*,\s*(ceo|founder|head)/i.test(text)
  )
    found.push('testimonial');
  if (/secure|encrypted|soc[\s-]?2|gdpr|hipaa|iso[\s-]?27001/i.test(text)) found.push('security');
  if (/guarantee|refund|money[\s-]?back|cancel anytime|no commitment/i.test(text))
    found.push('guarantee');
  if (/\d{1,3},?\d{3}\+?\s*(?:users|customers|teams|companies)/i.test(text))
    found.push('social-proof-metric');
  if (/(?:contact|talk to|email)\s+(?:us|sales|support)/i.test(text)) found.push('support-access');
  if (/free trial|free forever|no credit card/i.test(text)) found.push('low-commitment');
  return Array.from(new Set(found));
}

function countFormFields(code: string): { required: number; total: number } {
  const inputs = [...code.matchAll(/<(?:input|textarea|select)\b([^>]*)/gi)];
  let required = 0;
  for (const m of inputs) {
    if (/\brequired\b/.test(m[1])) required++;
  }
  return { required, total: inputs.length };
}

function detectDensity(code: string): 'compact' | 'default' | 'airy' {
  let tight = 0;
  let loose = 0;
  for (const m of code.matchAll(/(?<![A-Za-z0-9_-])(?:p|m|gap|space-[xy])-(\d+)\b/g)) {
    const n = parseInt(m[1], 10);
    if (n <= 2) tight++;
    else if (n >= 8) loose++;
  }
  if (tight > loose * 2) return 'compact';
  if (loose > tight * 2) return 'airy';
  return 'default';
}

export function extractPersonaSignals(code: string): PersonaSignals {
  const text = extractVisibleText(code);
  const wordCount = text ? text.split(/\s+/).length : 0;
  const paragraphCount = countMatches(code, /<p\b/gi);

  const buttons = countMatches(code, /<button\b/gi);
  const links = countMatches(code, /<a\b/gi);
  const inputs = countMatches(code, /<(?:input|textarea|select)\b/gi);
  const interactiveElements = buttons + links + inputs;

  const decisionPoints =
    countMatches(code, /<(?:select|input)[^>]*type=["']radio["']/gi) +
    countMatches(code, /<input[^>]*type=["']checkbox["']/gi) +
    countMatches(code, /<select\b/gi);

  const ctas = extractCtas(code);
  const headings = extractHeadings(code);
  const formFields = countFormFields(code);
  const trust = detectTrust(code);

  const formalIndicators = countMatches(
    text,
    /\b(?:therefore|moreover|furthermore|hence|thus|whereas)\b/gi
  );
  const casualIndicators = countMatches(text, /\b(?:you|let's|we're|don't|can't|gonna|stuff)\b/gi);

  const modalsAndOverlays =
    countMatches(code, /role=["']dialog["']/gi) + countMatches(code, /<dialog\b/gi);

  return {
    interactiveElements,
    decisionPoints,
    wordCount,
    paragraphCount,
    headings,
    primaryCtas: ctas.primary,
    competingCtas: Math.max(0, ctas.total - 1),
    requiredFormFields: formFields.required,
    totalFormFields: formFields.total,
    modalsAndOverlays,
    trustElements: trust,
    formalIndicators,
    casualIndicators,
    density: detectDensity(code),
  };
}

/**
 * Cognitive-load proxy score (0–100, higher = lower load = better for the user).
 * This is a rough number meant to stabilize the critique, not replace it.
 */
export function cognitiveLoadScore(s: PersonaSignals): number {
  let score = 100;
  if (s.interactiveElements > 8) score -= Math.min(25, (s.interactiveElements - 8) * 3);
  if (s.competingCtas > 1) score -= Math.min(20, (s.competingCtas - 1) * 5);
  if (s.headings.length > 6) score -= Math.min(10, (s.headings.length - 6) * 2);
  if (s.totalFormFields > 6) score -= Math.min(20, (s.totalFormFields - 6) * 3);
  if (s.modalsAndOverlays > 1) score -= Math.min(15, (s.modalsAndOverlays - 1) * 10);
  if (s.wordCount > 300) score -= Math.min(15, Math.floor((s.wordCount - 300) / 100) * 5);
  return Math.max(0, score);
}
