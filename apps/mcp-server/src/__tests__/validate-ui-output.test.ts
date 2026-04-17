import { describe, it, expect } from 'vitest';
import {
  extractColors,
  extractTailwindViolations,
  extractSpacingValues,
  extractBorderRadiusValues,
  extractFontSizes,
  extractZIndexValues,
  extractOpacityValues,
  extractBorderWidthValues,
  extractFonts,
  CSS_NAMED_COLORS,
  TAILWIND_PALETTE,
} from '../tools/validate-ui-output';

describe('extractColors — new formats', () => {
  it('detects hex colors (existing behavior preserved)', () => {
    const c = extractColors('color: #ff0000; background: #abc;');
    expect(c).toContain('#ff0000');
    expect(c).toContain('#abc');
  });

  it('detects rgb() and rgba()', () => {
    const c = extractColors('color: rgb(255, 0, 0); background: rgba(0,0,0,.5);');
    expect(c.some((s) => s.startsWith('rgb('))).toBe(true);
    expect(c.some((s) => s.startsWith('rgba('))).toBe(true);
  });

  it('detects hsl() and hsla()', () => {
    const c = extractColors('color: hsl(10, 50%, 50%); background: hsla(200, 50%, 50%, 0.8);');
    expect(c.some((s) => s.startsWith('hsl('))).toBe(true);
    expect(c.some((s) => s.startsWith('hsla('))).toBe(true);
  });

  it('detects oklch() and oklab()', () => {
    const c = extractColors('color: oklch(70% 0.2 120); background: oklab(0.6 0.1 0.1);');
    expect(c.some((s) => s.startsWith('oklch('))).toBe(true);
    expect(c.some((s) => s.startsWith('oklab('))).toBe(true);
  });

  it('detects color() function', () => {
    const c = extractColors('color: color(display-p3 1 0 0);');
    expect(c.some((s) => s.startsWith('color('))).toBe(true);
  });

  it('detects named colors', () => {
    const c = extractColors('color: red; background: cornflowerblue;');
    expect(c).toContain('red');
    expect(c).toContain('cornflowerblue');
  });

  it('does not match named colors inside identifiers', () => {
    const c = extractColors('const redBox = 1; className="border-red-500"');
    // "red" should not appear alone here — it's part of an identifier/class
    expect(c).not.toContain('red');
  });

  it('does not flag transparent/currentColor/inherit as named colors', () => {
    const c = extractColors('color: transparent; border: 1px solid currentColor; fill: inherit;');
    expect(c).not.toContain('transparent');
    expect(c).not.toContain('currentcolor');
    expect(c).not.toContain('inherit');
  });

  it('CSS_NAMED_COLORS includes Level 4 standards', () => {
    expect(CSS_NAMED_COLORS.has('rebeccapurple')).toBe(true);
    expect(CSS_NAMED_COLORS.has('red')).toBe(true);
  });
});

describe('extractTailwindViolations', () => {
  it('detects palette utility classes with various prefixes', () => {
    const code = 'className="bg-red-500 text-blue-600 border-slate-200"';
    const v = extractTailwindViolations(code);
    const values = v.map((x) => x.value);
    expect(values).toContain('bg-red-500');
    expect(values).toContain('text-blue-600');
    expect(values).toContain('border-slate-200');
    expect(v.every((x) => x.kind === 'utility')).toBe(true);
  });

  it('respects allow-list', () => {
    const approved = new Set(['bg-red-500']);
    const v = extractTailwindViolations('className="bg-red-500 text-blue-600"', approved);
    const values = v.map((x) => x.value);
    expect(values).not.toContain('bg-red-500');
    expect(values).toContain('text-blue-600');
  });

  it('detects opacity modifier on palette class', () => {
    const v = extractTailwindViolations('className="bg-red-500/80"');
    expect(v.map((x) => x.value)).toContain('bg-red-500/80');
  });

  it('detects arbitrary hex values', () => {
    const v = extractTailwindViolations('className="bg-[#ff0000] text-[#abc]"');
    const values = v.map((x) => x.value);
    expect(values).toContain('bg-[#ff0000]');
    expect(values).toContain('text-[#abc]');
    expect(v.every((x) => x.kind === 'arbitrary')).toBe(true);
  });

  it('detects arbitrary px/rem/number values', () => {
    const v = extractTailwindViolations('className="p-[13px] m-[2rem] gap-[7]"');
    const values = v.map((x) => x.value);
    expect(values).toContain('p-[13px]');
    expect(values).toContain('m-[2rem]');
    expect(values).toContain('gap-[7]');
  });

  it('detects arbitrary rgb/hsl values', () => {
    const v = extractTailwindViolations('className="bg-[rgb(1,2,3)] text-[hsl(10,20%,30%)]"');
    const values = v.map((x) => x.value);
    expect(values).toContain('bg-[rgb(1,2,3)]');
    expect(values).toContain('text-[hsl(10,20%,30%)]');
  });

  it('skips arbitrary values that are CSS var refs', () => {
    const v = extractTailwindViolations('className="bg-[var(--brand)]"');
    expect(v).toHaveLength(0);
  });

  it('skips non-styling arbitrary values', () => {
    const v = extractTailwindViolations('className="grid-cols-[auto]"');
    expect(v).toHaveLength(0);
  });

  it('does not flag non-palette class names like `flex-row`', () => {
    const v = extractTailwindViolations('className="flex flex-row items-center"');
    expect(v).toHaveLength(0);
  });

  it('TAILWIND_PALETTE includes all required colors', () => {
    for (const c of [
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
    ]) {
      expect(TAILWIND_PALETTE.has(c)).toBe(true);
    }
  });
});

describe('existing extractors still work', () => {
  it('spacing', () => {
    expect(extractSpacingValues('.x { padding: 13px; }')).toContain('13px');
    expect(extractSpacingValues('.x { padding: var(--p); }')).toHaveLength(0);
  });
  it('border-radius', () => {
    expect(extractBorderRadiusValues('.x { border-radius: 9px; }')).toContain('9px');
  });
  it('font-size', () => {
    expect(extractFontSizes('.x { font-size: 17px; }')).toContain('17px');
  });
  it('z-index', () => {
    expect(extractZIndexValues('.x { z-index: 42; }')).toContain('42');
  });
  it('opacity', () => {
    expect(extractOpacityValues('.x { opacity: 0.33; }')).toContain('0.33');
  });
  it('border-width', () => {
    expect(extractBorderWidthValues('.x { border-width: 3px; }')).toContain('3px');
  });
  it('fonts', () => {
    expect(extractFonts('.x { font-family: "Inter"; }').length).toBeGreaterThan(0);
  });
});
