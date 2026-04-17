/**
 * Deterministic anti-pattern (taste) rule engine.
 *
 * This complements the token-level validator by catching stylistic
 * anti-patterns that aren't captured by approved-token sets — gradients
 * on text, purple/blue SaaS gradients, aurora meshes, banned body fonts,
 * glow shadows, etc.
 *
 * All rules are regex-based — no parser, no DOM, no dependencies.
 */

export type AntiPatternSeverity = 'error' | 'warning';

export interface AntiPatternViolation {
  rule: string;
  severity: AntiPatternSeverity;
  line?: number;
  snippet: string;
  message: string;
  suggestion?: string;
}

export interface DetectAntiPatternsOptions {
  /** Filename/path — currently unused, reserved for per-file suppression. */
  filePath?: string;
  /** Restrict to a subset of rules. */
  enabledRules?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lineOf(code: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < code.length; i++) {
    if (code.charCodeAt(i) === 10) line++;
  }
  return line;
}

function snippet(code: string, index: number, length = 120): string {
  const start = Math.max(0, index);
  const end = Math.min(code.length, index + length);
  return code.slice(start, end).replace(/\s+/g, ' ').trim();
}

// Saturated/branded hue groups used to detect "SaaS gradient" smell.
const PURPLE_BLUE_HEXES = [
  // purple / violet / indigo
  '#a855f7',
  '#9333ea',
  '#7c3aed',
  '#6366f1',
  '#4f46e5',
  '#8b5cf6',
  '#c084fc',
  // blue / sky / cyan
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  '#0ea5e9',
  '#06b6d4',
  '#60a5fa',
];

const PURPLE_BLUE_KEYWORDS = ['purple', 'violet', 'indigo', 'blue', 'blueviolet', 'mediumpurple'];

const BANNED_SANS_FONTS = [
  'Inter',
  'Geist',
  'DM Sans',
  'Plus Jakarta',
  'Plus Jakarta Sans',
  'Space Grotesk',
  'Fraunces',
  'IBM Plex',
  'IBM Plex Sans',
  'IBM Plex Mono',
  'IBM Plex Serif',
  'Instrument',
  'Instrument Sans',
  'Instrument Serif',
];

// ---------------------------------------------------------------------------
// Individual rule detectors
// ---------------------------------------------------------------------------

function ruleGradientOnText(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  const re = /(?:-webkit-)?background-clip\s*:\s*text|bg-clip-text/gi;
  let m: RegExpExecArray | null;
  const matches: number[] = [];
  while ((m = re.exec(code)) !== null) matches.push(m.index);

  for (const idx of matches) {
    // Look within +/- 400 chars for a gradient signal
    const windowStart = Math.max(0, idx - 400);
    const windowEnd = Math.min(code.length, idx + 400);
    const window = code.slice(windowStart, windowEnd);
    if (
      /linear-gradient|radial-gradient|conic-gradient|bg-gradient-to-|from-\w+-\d{2,3}/i.test(
        window
      )
    ) {
      out.push({
        rule: 'gradient_on_text',
        severity: 'error',
        line: lineOf(code, idx),
        snippet: snippet(code, idx),
        message: 'Gradient applied to text via background-clip: text — avoid rainbow/brand text.',
        suggestion: 'Use a single solid token color for text; save gradients for surfaces.',
      });
    }
  }
  return out;
}

function rulePurpleBlueSaasGradient(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];

  // Tailwind form: from-<hue>-### .* to-<hue>-###
  const twRe =
    /\b(?:from|via|to)-(purple|violet|indigo|blue|sky|cyan|fuchsia)-\d{2,3}\b[^"'`]{0,200}\b(?:from|via|to)-(purple|violet|indigo|blue|sky|cyan|fuchsia)-\d{2,3}\b/gi;
  let m: RegExpExecArray | null;
  while ((m = twRe.exec(code)) !== null) {
    if (m[1] !== m[2]) {
      out.push({
        rule: 'purple_blue_saas_gradient',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Detected purple/blue SaaS gradient (${m[1]} → ${m[2]}).`,
        suggestion:
          'Use a monochromatic or editorial palette; reserve gradient accents for non-brand elements.',
      });
    }
  }

  // CSS linear-gradient(..., purple, blue) / indigo / violet
  const gradRe = /(?:linear|radial|conic)-gradient\s*\(([^)]+)\)/gi;
  while ((m = gradRe.exec(code)) !== null) {
    const inside = m[1].toLowerCase();
    const hueHits = new Set<string>();
    for (const kw of PURPLE_BLUE_KEYWORDS) {
      const kwRe = new RegExp(`\\b${kw}\\b`);
      if (kwRe.test(inside)) hueHits.add(kw.startsWith('blue') ? 'blue' : 'purple');
    }
    for (const hex of PURPLE_BLUE_HEXES) {
      if (inside.includes(hex)) {
        const isBlue = /#(?:3b82f6|2563eb|1d4ed8|0ea5e9|06b6d4|60a5fa)/.test(hex);
        hueHits.add(isBlue ? 'blue' : 'purple');
      }
    }
    if (hueHits.size >= 2) {
      out.push({
        rule: 'purple_blue_saas_gradient',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'CSS gradient blends purple/violet/indigo with blue/sky/cyan.',
        suggestion: 'Replace with a single-hue gradient or solid brand color.',
      });
    }
  }

  return out;
}

function ruleAuroraMesh(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];

  // bg-gradient-conic with 3+ color stops
  const conicTwRe = /bg-gradient-conic[^"'`]*?(?:from-\S+[^"'`]*?via-\S+[^"'`]*?to-\S+)/gi;
  let m: RegExpExecArray | null;
  while ((m = conicTwRe.exec(code)) !== null) {
    out.push({
      rule: 'aurora_mesh',
      severity: 'error',
      line: lineOf(code, m.index),
      snippet: snippet(code, m.index),
      message: 'Conic gradient with 3+ stops reads as an "aurora mesh" cliché.',
      suggestion: 'Use a single solid background or a subtle two-stop linear gradient.',
    });
  }

  // Multiple stacked radial-gradients as background (classic aurora mesh)
  // Walk declarations and count radial-gradient occurrences on a single background line.
  const bgDecl = /background(?:-image)?\s*:\s*([^;]+);/gi;
  while ((m = bgDecl.exec(code)) !== null) {
    const body = m[1];
    const count = (body.match(/radial-gradient\s*\(/gi) || []).length;
    if (count >= 2) {
      out.push({
        rule: 'aurora_mesh',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Background stacks ${count} radial-gradients — aurora mesh anti-pattern.`,
        suggestion: 'Flatten to a single solid or one subtle radial; avoid stacked blurs.',
      });
    }
  }

  // Inline style={{ background: "radial-gradient(...), radial-gradient(...)" }}
  const inlineRe = /radial-gradient\s*\([^)]*\)[^"'`]{0,20}?,\s*radial-gradient\s*\(/gi;
  while ((m = inlineRe.exec(code)) !== null) {
    out.push({
      rule: 'aurora_mesh',
      severity: 'error',
      line: lineOf(code, m.index),
      snippet: snippet(code, m.index),
      message: 'Stacked radial-gradients detected (aurora mesh).',
      suggestion: 'Use a single solid background instead.',
    });
  }

  return out;
}

function ruleBannedSansFont(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  for (const fontName of BANNED_SANS_FONTS) {
    // Match inside font-family, var name, or Tailwind font-[...] arbitrary value.
    // Use a permissive-but-anchored approach: require the banned token to appear
    // in a typographic context.
    const escaped = fontName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp(
      `(?:font-family\\s*:\\s*[^;]*?|--font[-_][\\w-]*\\s*:\\s*[^;]*?|font-\\[[^\\]]*?|["'\`])${escaped}`,
      'gi'
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      out.push({
        rule: 'banned_sans_font',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Banned font "${fontName}" — overused in generic AI/SaaS UI.`,
        suggestion:
          'Choose a distinctive family (e.g., a grotesque, humanist serif, or neo-grotesk with character).',
      });
    }
  }
  return out;
}

function ruleBorderLeftStripe(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];

  // Tailwind: border-l-[2-9] or border-l-[>=2]
  const twRe = /\bborder-l-(?:\[(\d+)(?:px|rem)?\]|([2-9]|\d{2,}))\b/g;
  let m: RegExpExecArray | null;
  while ((m = twRe.exec(code)) !== null) {
    const n = parseInt(m[1] || m[2] || '0', 10);
    if (n >= 2) {
      out.push({
        rule: 'border_left_stripe',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Thick left border (${m[0]}) — reads as "callout stripe" cliché.`,
        suggestion: 'Use a full subtle border, a background tint, or an inline icon instead.',
      });
    }
  }

  // CSS: border-left: Npx or border-left-width: Npx where N >= 2
  const cssRe = /border-left(?:-width)?\s*:\s*([^;]+);/gi;
  while ((m = cssRe.exec(code)) !== null) {
    const num = m[1].match(/(\d+(?:\.\d+)?)\s*px/);
    if (num && parseFloat(num[1]) >= 2) {
      out.push({
        rule: 'border_left_stripe',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Left border ${num[1]}px — stripe cliché.`,
        suggestion: 'Prefer a balanced border or a background tint.',
      });
    }
  }

  return out;
}

function ruleBackdropBlurOveruse(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  const re = /backdrop-blur(?:-\w+)?|backdrop-filter\s*:\s*blur/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) hits.push(m.index);
  if (hits.length >= 3) {
    out.push({
      rule: 'backdrop_blur_overuse',
      severity: 'warning',
      line: lineOf(code, hits[0]),
      snippet: snippet(code, hits[0]),
      message: `${hits.length} backdrop-blur uses in one file — overuse smells generic.`,
      suggestion: 'Limit glass effects to one surface (nav OR modal), not both.',
    });
  }
  return out;
}

function ruleNestedCards(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // Match className values containing "card" (case insensitive)
  const re = /className\s*=\s*["'`][^"'`]*\bcard\b[^"'`]*["'`]/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) hits.push(m.index);

  // Look for 3+ hits within a 400-char window
  for (let i = 0; i + 2 < hits.length; i++) {
    if (hits[i + 2] - hits[i] <= 400) {
      out.push({
        rule: 'nested_cards',
        severity: 'warning',
        line: lineOf(code, hits[i]),
        snippet: snippet(code, hits[i]),
        message: '3+ card-styled containers in close proximity — cards-in-cards smell.',
        suggestion: 'Flatten to a single surface; use spacing and typography for grouping.',
      });
      return out; // report once per file
    }
  }
  return out;
}

function ruleGlowShadow(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];

  // box-shadow with rgba alpha > 0.3 and a saturated hue (not near-neutral)
  const shadowRe = /(?:box-shadow|shadow)\s*:\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = shadowRe.exec(code)) !== null) {
    const body = m[1];
    const rgbaMatches = body.match(
      /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/gi
    );
    if (!rgbaMatches) continue;
    for (const rgba of rgbaMatches) {
      const parts = rgba.match(/\d+(?:\.\d+)?/g);
      if (!parts) continue;
      const [r, g, b, a] = parts.map(Number);
      const alpha = a === undefined ? 1 : a;
      if (alpha <= 0.3) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturated = max - min >= 80 && max >= 120;
      if (saturated) {
        out.push({
          rule: 'glow_shadow',
          severity: 'warning',
          line: lineOf(code, m.index),
          snippet: snippet(code, m.index),
          message: `Saturated, high-alpha shadow (${rgba}) reads as a "glow" — AI aesthetic smell.`,
          suggestion: 'Use neutral low-alpha shadows (rgba(0,0,0,0.05-0.15)) for realism.',
        });
      }
    }
  }

  // filter: drop-shadow(... rgba(...))
  // Allow one level of nested parens so rgba(...) inside drop-shadow is captured.
  const dsRe = /drop-shadow\s*\(((?:[^()]|\([^()]*\))*)\)/gi;
  while ((m = dsRe.exec(code)) !== null) {
    const body = m[1];
    const rgba = body.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/i);
    if (!rgba) continue;
    const parts = rgba[0].match(/\d+(?:\.\d+)?/g);
    if (!parts) continue;
    const [r, g, b, a] = parts.map(Number);
    const alpha = a === undefined ? 1 : a;
    if (alpha <= 0.3) continue;
    const saturated = Math.max(r, g, b) - Math.min(r, g, b) >= 80 && Math.max(r, g, b) >= 120;
    if (saturated) {
      out.push({
        rule: 'glow_shadow',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'drop-shadow with saturated, high-alpha color — glow smell.',
        suggestion: 'Use neutral low-alpha drop-shadows.',
      });
    }
  }

  return out;
}

function rulePureBlackOrWhite(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  const re =
    /#(?:000|fff|000000|ffffff)(?![0-9a-fA-F])|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out.push({
      rule: 'pure_black_or_white',
      severity: 'warning',
      line: lineOf(code, m.index),
      snippet: snippet(code, m.index),
      message: `Pure black/white (${m[0]}) — lacks softness; off-blacks/off-whites read better.`,
      suggestion: 'Use a near-black like #0a0a0a or an off-white like #fafaf9.',
    });
  }
  return out;
}

function ruleTextGradientClass(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // bg-gradient-to-* .* bg-clip-text .* text-transparent (order-insensitive within a className)
  const re = /className\s*=\s*["'`]([^"'`]*)["'`]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const cls = m[1];
    if (
      /\bbg-gradient-to-\w+/.test(cls) &&
      /\bbg-clip-text\b/.test(cls) &&
      /\btext-transparent\b/.test(cls)
    ) {
      out.push({
        rule: 'text_gradient_class',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'Tailwind text-gradient pattern — generic hero-title cliché.',
        suggestion: 'Use a solid heading color; let typography carry the weight.',
      });
    }
  }
  return out;
}

function ruleIconHeadingCardGrid(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // Grid container
  const gridRe = /className\s*=\s*["'`][^"'`]*\bgrid\b[^"'`]*["'`]/gi;
  let m: RegExpExecArray | null;
  while ((m = gridRe.exec(code)) !== null) {
    // Inspect next ~2000 chars after the grid opener
    const slice = code.slice(m.index, m.index + 2000);
    // Count repeating blocks that contain an Icon-like element + heading + paragraph
    const blockRe =
      /<(?:[A-Z][A-Za-z0-9]*Icon|Icon|svg)\b[^>]*\/?>[\s\S]{0,300}?<h[1-6]\b[\s\S]{0,300}?<p\b/g;
    const count = (slice.match(blockRe) || []).length;
    if (count >= 3) {
      out.push({
        rule: 'icon_heading_card_grid',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: `Grid of ${count} <Icon><h*><p> cards — generic feature-grid template.`,
        suggestion:
          'Vary the card composition, use editorial headings, or replace with a prose layout.',
      });
      return out;
    }
  }
  return out;
}

function ruleHeroMetricTemplate(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // Large font size token adjacent (within 300 chars) to a text-sm label
  const bigRe = /text-(?:[5-9]xl|\[(?:[4-9][0-9]|1[0-9]{2})px\])/g;
  let m: RegExpExecArray | null;
  while ((m = bigRe.exec(code)) !== null) {
    const window = code.slice(m.index, m.index + 300);
    if (/\btext-(?:xs|sm)\b/.test(window)) {
      out.push({
        rule: 'hero_metric_template',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: '"Big number + small label" stat block — overused hero metric pattern.',
        suggestion: 'Replace with a short sentence or an editorial stat treatment.',
      });
    }
  }
  return out;
}

function ruleEmojiAsIcon(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // Emoji inside a <Button> or <Icon> slot
  // Use broad Unicode ranges for common pictographs / emoji.
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F0FF}]/u;
  const re =
    /<(?:Button|Icon|IconButton|button)\b[^>]*>([\s\S]{0,120}?)<\/(?:Button|Icon|IconButton|button)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (emoji.test(m[1])) {
      out.push({
        rule: 'emoji_as_icon',
        severity: 'warning',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'Emoji used as an icon inside a Button/Icon — imprecise and inconsistent.',
        suggestion: 'Use a proper icon component (lucide, heroicons, or custom SVG).',
      });
    }
  }
  return out;
}

function ruleInlineImportant(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];
  // !important inside style= / style={{...}} attributes
  const re = /style\s*=\s*(?:["'`{][^"'`}]*|\{\{[^}]*)!important/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out.push({
      rule: 'inline_important',
      severity: 'error',
      line: lineOf(code, m.index),
      snippet: snippet(code, m.index),
      message: '!important used in an inline style — specificity hack.',
      suggestion: 'Remove !important; restructure CSS or use a utility class.',
    });
  }
  return out;
}

function ruleOutlineNoneNoReplacement(code: string): AntiPatternViolation[] {
  const out: AntiPatternViolation[] = [];

  // Tailwind outline-none usage
  const twRe = /\boutline-none\b/g;
  let m: RegExpExecArray | null;
  while ((m = twRe.exec(code)) !== null) {
    const windowStart = Math.max(0, m.index - 200);
    const windowEnd = Math.min(code.length, m.index + 400);
    const window = code.slice(windowStart, windowEnd);
    if (!/focus(?:-visible)?:(?:ring|outline)/.test(window)) {
      out.push({
        rule: 'outline_none_no_replacement',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'outline-none without a focus:ring / focus-visible:outline — a11y violation.',
        suggestion: 'Add focus-visible:outline-2 or focus:ring-2 to restore focus indication.',
      });
    }
  }

  // CSS outline: none
  const cssRe = /outline\s*:\s*none\s*(?:!important)?\s*;/gi;
  while ((m = cssRe.exec(code)) !== null) {
    const windowStart = Math.max(0, m.index - 300);
    const windowEnd = Math.min(code.length, m.index + 500);
    const window = code.slice(windowStart, windowEnd);
    if (!/:focus(?:-visible)?[\s\S]{0,200}?(?:outline|box-shadow|ring)/i.test(window)) {
      out.push({
        rule: 'outline_none_no_replacement',
        severity: 'error',
        line: lineOf(code, m.index),
        snippet: snippet(code, m.index),
        message: 'outline: none without a :focus replacement — a11y violation.',
        suggestion: 'Add a :focus-visible outline or box-shadow ring.',
      });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type Detector = (code: string) => AntiPatternViolation[];

export const ANTI_PATTERN_RULES: Record<string, Detector> = {
  gradient_on_text: ruleGradientOnText,
  purple_blue_saas_gradient: rulePurpleBlueSaasGradient,
  aurora_mesh: ruleAuroraMesh,
  banned_sans_font: ruleBannedSansFont,
  border_left_stripe: ruleBorderLeftStripe,
  backdrop_blur_overuse: ruleBackdropBlurOveruse,
  nested_cards: ruleNestedCards,
  glow_shadow: ruleGlowShadow,
  pure_black_or_white: rulePureBlackOrWhite,
  text_gradient_class: ruleTextGradientClass,
  icon_heading_card_grid: ruleIconHeadingCardGrid,
  hero_metric_template: ruleHeroMetricTemplate,
  emoji_as_icon: ruleEmojiAsIcon,
  inline_important: ruleInlineImportant,
  outline_none_no_replacement: ruleOutlineNoneNoReplacement,
};

export function detectAntiPatterns(
  code: string,
  options: DetectAntiPatternsOptions = {}
): AntiPatternViolation[] {
  const enabled = options.enabledRules
    ? new Set(options.enabledRules)
    : new Set(Object.keys(ANTI_PATTERN_RULES));
  const all: AntiPatternViolation[] = [];
  for (const [name, fn] of Object.entries(ANTI_PATTERN_RULES)) {
    if (!enabled.has(name)) continue;
    try {
      all.push(...fn(code));
    } catch {
      // Never let a single regex blow up the whole run.
    }
  }
  // Stable sort: by line then rule
  all.sort((a, b) => (a.line || 0) - (b.line || 0) || a.rule.localeCompare(b.rule));
  return all;
}
