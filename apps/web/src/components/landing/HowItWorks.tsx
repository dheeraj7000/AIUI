interface Step {
  id: string;
  title: string;
  body: string;
  specimen: React.ReactNode;
  takeaway: string;
}

const steps: Step[] = [
  {
    id: '01',
    title: 'Write down your design decisions.',
    body: 'Pick a style pack in the studio, import tokens you already have, or bring a Figma file. AIUI turns those decisions into a small set of files inside your project — .aiui/ — that become the source of truth.',
    specimen: (
      <pre className="specimen" style={{ padding: '1rem 1.25rem' }}>
        <code>
          <span className="cm-dim">// .aiui/tokens.json</span>
          {'\n'}
          {'{\n  '}
          <span className="cm-key">&quot;color.primary&quot;</span>
          <span className="cm-punct">:</span>{' '}
          <span className="cm-string">&quot;oklch(44% 0.14 28)&quot;</span>
          <span className="cm-punct">,</span>
          {'\n  '}
          <span className="cm-key">&quot;radius.md&quot;</span>
          <span className="cm-punct">:</span> <span className="cm-string">&quot;2px&quot;</span>
          <span className="cm-punct">,</span>
          {'\n  '}
          <span className="cm-key">&quot;type.body&quot;</span>
          <span className="cm-punct">:</span>{' '}
          <span className="cm-string">&quot;Switzer, sans-serif&quot;</span>
          {'\n}'}
        </code>
      </pre>
    ),
    takeaway: 'Your tokens, written once, in one place.',
  },
  {
    id: '02',
    title: 'Connect your editor.',
    body: 'Run one command. Claude Code, Cursor, Windsurf, and VS Code all pick up the same AIUI server — no packages, no build plugins, no config to maintain. (AIUI runs over MCP, the standard extension protocol Claude and Cursor already use; think of it as a VS Code plugin, but for any AI editor.)',
    specimen: (
      <pre className="specimen" style={{ padding: '1rem 1.25rem' }}>
        <code>
          <span className="cm-dim">$</span> <span className="cm-key">claude</span>{' '}
          <span className="cm-tag">mcp</span> <span className="cm-attr">add</span>{' '}
          <span className="cm-string">aiui</span>
          {'\n'}
          <span className="cm-dim">✓ connected to aiui.store</span>
          {'\n'}
          <span className="cm-dim">✓ 24 tokens · 12 components · 8 rules in scope</span>
        </code>
      </pre>
    ),
    takeaway: 'Ninety seconds, tops.',
  },
  {
    id: '03',
    title: 'Build as usual. The AI follows.',
    body: 'Keep prompting the way you already do. Every UI Claude produces now pulls from your tokens, uses your approved components, and respects your rules. Output gets validated against the tokens before it lands.',
    specimen: (
      <pre className="specimen" style={{ padding: '1rem 1.25rem' }}>
        <code>
          <span className="cm-dim">you:</span> &quot;Add a settings page.&quot;
          {'\n\n'}
          <span className="cm-dim">claude:</span>
          {'\n'}
          <span className="cm-punct">{'<'}</span>
          <span className="cm-tag">Page</span> <span className="cm-attr">title</span>
          <span className="cm-punct">=</span>
          <span className="cm-string">&quot;Settings&quot;</span>
          <span className="cm-punct">{'>'}</span>
          {'\n  '}
          <span className="cm-punct">{'<'}</span>
          <span className="cm-tag">Button</span> <span className="cm-attr">variant</span>
          <span className="cm-punct">=</span>
          <span className="cm-string">&quot;primary&quot;</span>
          <span className="cm-punct">{'>'}</span>
          Save<span className="cm-punct">{'</'}</span>
          <span className="cm-tag">Button</span>
          <span className="cm-punct">{'>'}</span>
          {'\n'}
          <span className="cm-punct">{'</'}</span>
          <span className="cm-tag">Page</span>
          <span className="cm-punct">{'>'}</span>
        </code>
      </pre>
    ),
    takeaway: 'Your design, on every screen, automatically.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative" style={{ background: 'var(--paper-deep)' }}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-24 lg:py-32">
        {/* Opener */}
        <div className="grid grid-cols-12 gap-6 items-baseline">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="section-numeral">03</span>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow">How it works</span>
            <h2
              className="display mt-3"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', lineHeight: 1.05 }}
            >
              Three steps. Read top to bottom.
            </h2>
            <p className="lede mt-5">
              No build plugins to configure. No packages to install. Just three moments where you
              make a decision, and then the AI stops inventing.
            </p>
          </div>
        </div>

        <hr className="rule mt-12" style={{ height: 1, border: 0, background: 'var(--ink)' }} />

        <ol>
          {steps.map((step, idx) => (
            <li
              key={step.id}
              className="grid grid-cols-12 gap-6 py-12 lg:py-16"
              style={{
                borderBottom: idx < steps.length - 1 ? '1px solid var(--rule)' : undefined,
              }}
            >
              <div className="col-span-2 md:col-span-1">
                <span
                  className="display"
                  style={{
                    fontSize: 'clamp(2.25rem, 3vw, 2.75rem)',
                    lineHeight: 1,
                    color: 'var(--accent)',
                    fontVariantNumeric: 'oldstyle-nums',
                  }}
                >
                  {step.id}
                </span>
              </div>

              <div className="col-span-10 md:col-span-5 lg:col-span-5">
                <h3
                  className="display"
                  style={{
                    fontSize: 'clamp(1.625rem, 2.2vw, 2rem)',
                    lineHeight: 1.1,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-4"
                  style={{
                    color: 'var(--ink-soft)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    maxWidth: '52ch',
                  }}
                >
                  {step.body}
                </p>
                <p
                  className="mt-5"
                  style={{
                    color: 'var(--ink)',
                    fontSize: '0.9375rem',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    maxWidth: '48ch',
                  }}
                >
                  {step.takeaway}
                </p>
              </div>

              <div className="col-span-12 md:col-span-6 lg:col-span-6 md:pl-4">
                {step.specimen}
                <div className="figure-caption" style={{ justifyContent: 'space-between' }}>
                  <span className="fig-id">Fig. 03.{step.id.replace('0', '')}</span>
                  <span className="leader" aria-hidden />
                  <span>Step {step.id}, in detail.</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
