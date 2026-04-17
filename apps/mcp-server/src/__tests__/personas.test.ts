import { describe, it, expect } from 'vitest';
import { critiqueByPersonas } from '../tools/personas';
import type { Violation } from '../tools/validate-ui-output';

function findByPersona(findings: ReturnType<typeof critiqueByPersonas>, name: string) {
  return findings.find((f) => f.persona === name);
}

describe('critiqueByPersonas — First-time user', () => {
  it('positive: flags when >2 primary CTAs, missing h1, and unlabeled input', () => {
    const code = `
      <form>
        <button variant="primary">Sign up</button>
        <button variant="primary">Get started</button>
        <button variant="primary">Try it</button>
        <input type="text" placeholder="name" />
      </form>
    `;
    const finding = findByPersona(critiqueByPersonas(code, []), 'First-time user');
    expect(finding).toBeDefined();
    expect(finding!.finding).toMatch(/primary|h1|label/i);
    expect(finding!.evidence.length).toBeGreaterThan(0);
  });

  it('negative: clean page with single CTA, h1, and labeled input produces no finding', () => {
    const code = `
      <main>
        <h1>Welcome</h1>
        <form>
          <label for="name">Name</label>
          <input id="name" type="text" />
          <button variant="primary">Submit</button>
        </form>
      </main>
    `;
    expect(findByPersona(critiqueByPersonas(code, []), 'First-time user')).toBeUndefined();
  });
});

describe('critiqueByPersonas — Speed reader', () => {
  it('positive: flags a >400 char paragraph wall', () => {
    const wall = 'Lorem ipsum '.repeat(60); // ~720 chars
    const code = `<h1>Doc</h1><p>${wall}</p>`;
    const finding = findByPersona(critiqueByPersonas(code, []), 'Speed reader');
    expect(finding).toBeDefined();
    expect(finding!.finding).toMatch(/paragraph|scan|heading/i);
  });

  it('negative: well-structured short content produces no finding', () => {
    const code = `
      <h1>Title</h1>
      <h2>Section</h2>
      <p>Short intro sentence.</p>
      <h2>Next</h2>
      <p>Another short one.</p>
    `;
    expect(findByPersona(critiqueByPersonas(code, []), 'Speed reader')).toBeUndefined();
  });
});

describe('critiqueByPersonas — Keyboard user', () => {
  it('positive: flags clickable div with no role and outline-none with no focus ring', () => {
    const code = `
      <div onClick={go} className="outline-none">Click me</div>
    `;
    const finding = findByPersona(critiqueByPersonas(code, []), 'Keyboard user');
    expect(finding).toBeDefined();
    expect(finding!.finding).toMatch(/onClick|focus|role/i);
  });

  it('negative: real buttons with focus-visible ring produce no finding', () => {
    const code = `
      <button className="outline-none focus-visible:ring-2" onClick={go}>Go</button>
    `;
    expect(findByPersona(critiqueByPersonas(code, []), 'Keyboard user')).toBeUndefined();
  });
});

describe('critiqueByPersonas — Accessibility need', () => {
  it('positive: flags missing alt, icon-only button, and contrast violation', () => {
    const code = `
      <img src="/hero.png" />
      <button><svg viewBox="0 0 24 24"><path d="M1 1" /></svg></button>
      <p>Delete the red items below.</p>
    `;
    const violations: Violation[] = [
      {
        type: 'accessibility',
        severity: 'warning',
        message: 'Low color contrast ratio (2.10:1) between #888 and #999 — WCAG AA requires 4.5:1',
      },
    ];
    const finding = findByPersona(critiqueByPersonas(code, violations), 'Accessibility need');
    expect(finding).toBeDefined();
    expect(finding!.finding).toMatch(/alt|aria|contrast|color/i);
    expect(finding!.evidence.length).toBeGreaterThan(0);
  });

  it('negative: images with alt, labeled icon buttons, and no color-only copy produces no finding', () => {
    const code = `
      <img src="/hero.png" alt="Product hero" />
      <button aria-label="Close dialog"><svg viewBox="0 0 24 24"><path d="M1 1" /></svg></button>
      <p>Delete the selected items below.</p>
    `;
    expect(findByPersona(critiqueByPersonas(code, []), 'Accessibility need')).toBeUndefined();
  });
});
