import { describe, it, expect } from 'vitest';
import { detectAntiPatterns } from '../tools/anti-patterns';

function rules(code: string): string[] {
  return detectAntiPatterns(code).map((v) => v.rule);
}

describe('gradient_on_text', () => {
  it('flags -webkit-background-clip: text with a linear-gradient', () => {
    const code = `
      .hero { background: linear-gradient(90deg, #ff0, #f0f); -webkit-background-clip: text; }
    `;
    expect(rules(code)).toContain('gradient_on_text');
  });

  it('flags Tailwind bg-clip-text next to bg-gradient-to-r', () => {
    const code = `<h1 className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">hi</h1>`;
    expect(rules(code)).toContain('gradient_on_text');
  });

  it('does not flag background-clip: padding-box (no gradient nearby)', () => {
    const code = `.card { background-clip: padding-box; color: black; }`;
    expect(rules(code)).not.toContain('gradient_on_text');
  });
});

describe('purple_blue_saas_gradient', () => {
  it('flags Tailwind from-purple-500 to-blue-500', () => {
    const code = `<div className="bg-gradient-to-r from-purple-500 to-blue-500" />`;
    expect(rules(code)).toContain('purple_blue_saas_gradient');
  });

  it('flags CSS linear-gradient with purple/blue hex', () => {
    const code = `.x { background: linear-gradient(135deg, #a855f7, #3b82f6); }`;
    expect(rules(code)).toContain('purple_blue_saas_gradient');
  });

  it('does not flag a monochromatic gradient (from-slate-200 to-slate-400)', () => {
    const code = `<div className="bg-gradient-to-r from-slate-200 to-slate-400" />`;
    expect(rules(code)).not.toContain('purple_blue_saas_gradient');
  });
});

describe('aurora_mesh', () => {
  it('flags stacked radial-gradients in CSS background', () => {
    const code = `.x { background: radial-gradient(at 0% 0%, #f0f, transparent), radial-gradient(at 100% 100%, #0ff, transparent); }`;
    expect(rules(code)).toContain('aurora_mesh');
  });

  it('flags bg-gradient-conic with 3+ stops', () => {
    const code = `<div className="bg-gradient-conic from-pink-500 via-purple-500 to-blue-500" />`;
    expect(rules(code)).toContain('aurora_mesh');
  });

  it('does not flag a single radial-gradient', () => {
    const code = `.x { background: radial-gradient(circle, #eee, #fff); }`;
    expect(rules(code)).not.toContain('aurora_mesh');
  });
});

describe('banned_sans_font', () => {
  it('flags Inter in font-family', () => {
    const code = `body { font-family: "Inter", sans-serif; }`;
    expect(rules(code)).toContain('banned_sans_font');
  });

  it('flags Geist in a CSS variable', () => {
    const code = `:root { --font-sans: "Geist", system-ui; }`;
    expect(rules(code)).toContain('banned_sans_font');
  });

  it('does not flag a permitted distinctive font', () => {
    const code = `body { font-family: "Söhne", serif; }`;
    expect(rules(code)).not.toContain('banned_sans_font');
  });
});

describe('border_left_stripe', () => {
  it('flags Tailwind border-l-4', () => {
    const code = `<div className="border-l-4 border-red-500" />`;
    expect(rules(code)).toContain('border_left_stripe');
  });

  it('flags CSS border-left: 4px', () => {
    const code = `.alert { border-left: 4px solid red; }`;
    expect(rules(code)).toContain('border_left_stripe');
  });

  it('does not flag border-l (default 1px)', () => {
    const code = `<div className="border-l border-gray-200" />`;
    expect(rules(code)).not.toContain('border_left_stripe');
  });
});

describe('backdrop_blur_overuse', () => {
  it('flags 3+ backdrop-blur uses', () => {
    const code = `<div className="backdrop-blur-lg"/><div className="backdrop-blur-md"/><div className="backdrop-blur-sm"/>`;
    expect(rules(code)).toContain('backdrop_blur_overuse');
  });

  it('flags mixed Tailwind + CSS backdrop blurs', () => {
    const code = `
      .a { backdrop-filter: blur(8px); }
      <div className="backdrop-blur-md" />
      <div className="backdrop-blur-xl" />
    `;
    expect(rules(code)).toContain('backdrop_blur_overuse');
  });

  it('does not flag a single backdrop-blur', () => {
    const code = `<nav className="backdrop-blur-md" />`;
    expect(rules(code)).not.toContain('backdrop_blur_overuse');
  });
});

describe('nested_cards', () => {
  it('flags 3 close card classNames', () => {
    const code = `<div className="card p-4"><div className="card inner"><div className="card deep">x</div></div></div>`;
    expect(rules(code)).toContain('nested_cards');
  });

  it('flags 3 card-* variants in proximity', () => {
    const code = `<div className="feature-card"><div className="card-body"><div className="card-inner">x</div></div></div>`;
    expect(rules(code)).toContain('nested_cards');
  });

  it('does not flag a single card', () => {
    const code = `<div className="card p-4">hi</div>`;
    expect(rules(code)).not.toContain('nested_cards');
  });
});

describe('glow_shadow', () => {
  it('flags saturated high-alpha box-shadow', () => {
    const code = `.btn { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }`;
    expect(rules(code)).toContain('glow_shadow');
  });

  it('flags drop-shadow with saturated color', () => {
    const code = `.icon { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.7)); }`;
    expect(rules(code)).toContain('glow_shadow');
  });

  it('does not flag neutral low-alpha shadow', () => {
    const code = `.card { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }`;
    expect(rules(code)).not.toContain('glow_shadow');
  });
});

describe('pure_black_or_white', () => {
  it('flags #000', () => {
    expect(rules(`.x { color: #000; }`)).toContain('pure_black_or_white');
  });

  it('flags rgb(255, 255, 255)', () => {
    expect(rules(`.x { background: rgb(255, 255, 255); }`)).toContain('pure_black_or_white');
  });

  it('does not flag #0a0a0a', () => {
    expect(rules(`.x { color: #0a0a0a; }`)).not.toContain('pure_black_or_white');
  });
});

describe('text_gradient_class', () => {
  it('flags full tailwind text-gradient triple', () => {
    const code = `<h1 className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">Hi</h1>`;
    expect(rules(code)).toContain('text_gradient_class');
  });

  it('flags regardless of order', () => {
    const code = `<h1 className="text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-500">Hi</h1>`;
    expect(rules(code)).toContain('text_gradient_class');
  });

  it('does not flag plain solid heading', () => {
    const code = `<h1 className="text-slate-900 font-semibold">Hi</h1>`;
    expect(rules(code)).not.toContain('text_gradient_class');
  });
});

describe('icon_heading_card_grid', () => {
  it('flags 3+ Icon/h*/p cards in a grid', () => {
    const code = `
      <div className="grid grid-cols-3 gap-4">
        <div><FeatureIcon /><h3>One</h3><p>first</p></div>
        <div><FeatureIcon /><h3>Two</h3><p>second</p></div>
        <div><FeatureIcon /><h3>Three</h3><p>third</p></div>
      </div>
    `;
    expect(rules(code)).toContain('icon_heading_card_grid');
  });

  it('flags svg + heading + p grid blocks', () => {
    const code = `
      <section className="grid grid-cols-3">
        <div><svg viewBox="0 0 24 24"/><h4>A</h4><p>a</p></div>
        <div><svg viewBox="0 0 24 24"/><h4>B</h4><p>b</p></div>
        <div><svg viewBox="0 0 24 24"/><h4>C</h4><p>c</p></div>
      </section>
    `;
    expect(rules(code)).toContain('icon_heading_card_grid');
  });

  it('does not flag a simple 2-item list', () => {
    const code = `
      <div className="grid grid-cols-2">
        <div><Icon/><h3>One</h3><p>x</p></div>
        <div><Icon/><h3>Two</h3><p>y</p></div>
      </div>
    `;
    expect(rules(code)).not.toContain('icon_heading_card_grid');
  });
});

describe('hero_metric_template', () => {
  it('flags text-6xl adjacent to text-sm', () => {
    const code = `<div><div className="text-6xl">99%</div><div className="text-sm">uptime</div></div>`;
    expect(rules(code)).toContain('hero_metric_template');
  });

  it('flags text-[72px] adjacent to text-xs', () => {
    const code = `<div><div className="text-[72px]">42</div><div className="text-xs">label</div></div>`;
    expect(rules(code)).toContain('hero_metric_template');
  });

  it('does not flag text-6xl without a nearby small label', () => {
    const code = `<h1 className="text-6xl">Welcome to the future of work</h1>`;
    expect(rules(code)).not.toContain('hero_metric_template');
  });
});

describe('emoji_as_icon', () => {
  it('flags emoji inside a Button slot', () => {
    const code = `<Button>\u{1F680} Launch</Button>`;
    expect(rules(code)).toContain('emoji_as_icon');
  });

  it('flags emoji inside an Icon slot', () => {
    const code = `<Icon>\u{2728}</Icon>`;
    expect(rules(code)).toContain('emoji_as_icon');
  });

  it('does not flag a Button with plain text', () => {
    const code = `<Button>Launch</Button>`;
    expect(rules(code)).not.toContain('emoji_as_icon');
  });
});

describe('inline_important', () => {
  it('flags !important inside a style attribute', () => {
    const code = `<div style="color: red !important;" />`;
    expect(rules(code)).toContain('inline_important');
  });

  it('flags !important inside a JSX style object', () => {
    const code = `<div style={{ color: 'red !important' }} />`;
    expect(rules(code)).toContain('inline_important');
  });

  it('does not flag plain inline styles', () => {
    const code = `<div style={{ color: 'red' }} />`;
    expect(rules(code)).not.toContain('inline_important');
  });
});

describe('outline_none_no_replacement', () => {
  it('flags outline-none without focus:ring', () => {
    const code = `<button className="outline-none px-4 py-2">Hit</button>`;
    expect(rules(code)).toContain('outline_none_no_replacement');
  });

  it('flags CSS outline: none with no :focus replacement', () => {
    const code = `button { outline: none; }`;
    expect(rules(code)).toContain('outline_none_no_replacement');
  });

  it('does not flag outline-none when focus-visible:outline is present', () => {
    const code = `<button className="outline-none focus-visible:outline-2 focus-visible:outline-sky-500">Hit</button>`;
    expect(rules(code)).not.toContain('outline_none_no_replacement');
  });
});

describe('detectAntiPatterns — integration', () => {
  it('returns empty array for a well-formed component', () => {
    const code = `
      <section className="py-16">
        <h2 className="text-3xl font-semibold text-neutral-900">Clean heading</h2>
        <p className="mt-4 text-neutral-600">A calm paragraph without tricks.</p>
      </section>
    `;
    expect(detectAntiPatterns(code)).toEqual([]);
  });

  it('catches multiple rules in the same file', () => {
    const code = `
      body { font-family: "Inter"; }
      .btn { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
      <h1 className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Hi</h1>
    `;
    const found = rules(code);
    expect(found).toContain('banned_sans_font');
    expect(found).toContain('glow_shadow');
    expect(found).toContain('purple_blue_saas_gradient');
    expect(found).toContain('text_gradient_class');
  });

  it('respects enabledRules option', () => {
    const code = `body { font-family: "Inter"; color: #000; }`;
    const only = detectAntiPatterns(code, { enabledRules: ['banned_sans_font'] });
    expect(only.every((v) => v.rule === 'banned_sans_font')).toBe(true);
  });
});
