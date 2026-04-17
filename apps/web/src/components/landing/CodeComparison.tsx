'use client';

export function CodeComparison() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-24 lg:py-32">
        {/* Opener */}
        <div className="grid grid-cols-12 gap-6 items-baseline">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="section-numeral">04</span>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow">The difference</span>
            <h2
              className="display mt-3"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', lineHeight: 1.05 }}
            >
              Same prompt. Same model. Different output.
            </h2>
            <p className="lede mt-5">
              The only variable between these two generations is whether AIUI was connected. On the
              left, the AI invents. On the right, it obeys.
            </p>
          </div>
        </div>

        <hr className="rule mt-12" style={{ height: 1, border: 0, background: 'var(--ink)' }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 relative">
          {/* Verso — without AIUI */}
          <div
            className="py-10 lg:py-12 lg:pr-10"
            style={{
              borderBottom: '1px solid var(--rule)',
            }}
          >
            <div className="flex items-baseline gap-3">
              <span className="eyebrow">Verso</span>
              <span className="leader" aria-hidden />
              <span className="eyebrow">Unguided</span>
            </div>
            <h3 className="display mt-4" style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>
              Prompt: <em>Build me a settings page.</em>
            </h3>
            <p
              className="mt-4 text-[0.9375rem]"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: '48ch' }}
            >
              Inline styles. A color the AI made up. A radius that matches nothing else in the app.
              A heading size no one approved.
            </p>

            <pre className="specimen mt-6" style={{ padding: '1.125rem 1.375rem' }}>
              <code>
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">div</span> <span className="cm-attr">style</span>
                <span className="cm-punct">={'{{ '}</span>
                <span className="cm-attr">padding</span>
                <span className="cm-punct">: </span>
                <span className="cm-num">20</span>
                <span className="cm-punct">{' }}'}</span>
                <span className="cm-punct">{'>'}</span>
                {'\n  '}
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">h1</span> <span className="cm-attr">style</span>
                <span className="cm-punct">={'{{ '}</span>
                <span className="cm-attr">fontSize</span>
                <span className="cm-punct">: </span>
                <span className="cm-num">24</span>
                <span className="cm-punct">, </span>
                <span className="cm-attr">color</span>
                <span className="cm-punct">: </span>
                <span className="cm-string">&quot;navy&quot;</span>
                <span className="cm-punct">{' }}'}</span>
                <span className="cm-punct">{'>'}</span>
                {'\n    '}Settings
                {'\n  '}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">h1</span>
                <span className="cm-punct">{'>'}</span>
                {'\n  '}
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">button</span> <span className="cm-attr">style</span>
                <span className="cm-punct">={'{{ '}</span>
                {'\n    '}
                <span className="cm-attr">background</span>
                <span className="cm-punct">: </span>
                <span className="cm-string">&quot;cornflowerblue&quot;</span>
                <span className="cm-punct">,</span>
                {'\n    '}
                <span className="cm-attr">padding</span>
                <span className="cm-punct">: </span>
                <span className="cm-string">&quot;8px 16px&quot;</span>
                <span className="cm-punct">,</span>
                {'\n    '}
                <span className="cm-attr">borderRadius</span>
                <span className="cm-punct">: </span>
                <span className="cm-num">4</span>
                <span className="cm-punct">,</span>
                {'\n  '}
                <span className="cm-punct">{'}}'}</span>
                <span className="cm-punct">{'>'}</span>
                {'\n    '}Save Changes
                {'\n  '}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">button</span>
                <span className="cm-punct">{'>'}</span>
                {'\n'}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">div</span>
                <span className="cm-punct">{'>'}</span>
              </code>
            </pre>
            <div className="figure-caption" style={{ justifyContent: 'space-between' }}>
              <span className="fig-id">Fig. 04.A</span>
              <span className="leader" aria-hidden />
              <span>3 hard-coded values. 0 tokens. 0 approved components.</span>
            </div>
          </div>

          {/* Recto — with AIUI */}
          <div
            className="py-10 lg:py-12 lg:pl-10 relative"
            style={{
              borderLeft: '1px solid var(--rule)',
              borderBottom: '1px solid var(--rule)',
            }}
          >
            <div className="flex items-baseline gap-3">
              <span className="eyebrow">Recto</span>
              <span className="leader" aria-hidden />
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>
                AIUI connected
              </span>
            </div>
            <h3 className="display mt-4" style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>
              Prompt: <em>Build me a settings page.</em>
            </h3>
            <p
              className="mt-4 text-[0.9375rem]"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: '48ch' }}
            >
              Your approved Button component. Your page-heading scale. Your spacing rhythm. Zero
              inline styles — every visual decision traces back to a token.
            </p>

            <pre className="specimen mt-6" style={{ padding: '1.125rem 1.375rem' }}>
              <code>
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">Page</span> <span className="cm-attr">title</span>
                <span className="cm-punct">=</span>
                <span className="cm-string">&quot;Settings&quot;</span>
                <span className="cm-punct">{'>'}</span>
                {'\n  '}
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">Heading</span> <span className="cm-attr">level</span>
                <span className="cm-punct">=</span>
                <span className="cm-string">&quot;page&quot;</span>
                <span className="cm-punct">{'>'}</span>Settings
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">Heading</span>
                <span className="cm-punct">{'>'}</span>
                {'\n  '}
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">Stack</span> <span className="cm-attr">gap</span>
                <span className="cm-punct">=</span>
                <span className="cm-string">&quot;space.6&quot;</span>
                <span className="cm-punct">{'>'}</span>
                {'\n    '}
                <span className="cm-dim">{'/* fields omitted */'}</span>
                {'\n    '}
                <span className="cm-punct">{'<'}</span>
                <span className="cm-tag">Button</span> <span className="cm-attr">variant</span>
                <span className="cm-punct">=</span>
                <span className="cm-string">&quot;primary&quot;</span>{' '}
                <span className="cm-attr">size</span>
                <span className="cm-punct">=</span>
                <span className="cm-string">&quot;md&quot;</span>
                <span className="cm-punct">{'>'}</span>
                {'\n      '}Save changes
                {'\n    '}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">Button</span>
                <span className="cm-punct">{'>'}</span>
                {'\n  '}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">Stack</span>
                <span className="cm-punct">{'>'}</span>
                {'\n'}
                <span className="cm-punct">{'</'}</span>
                <span className="cm-tag">Page</span>
                <span className="cm-punct">{'>'}</span>
              </code>
            </pre>
            <div className="figure-caption" style={{ justifyContent: 'space-between' }}>
              <span className="fig-id">Fig. 04.B</span>
              <span className="leader" aria-hidden />
              <span>3 approved components. 1 spacing token. 0 drift.</span>
            </div>
          </div>
        </div>

        {/* Editorial takeaway */}
        <p
          className="display mt-10 lg:mt-12"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.35,
            color: 'var(--ink)',
            maxWidth: '42ch',
            fontStyle: 'italic',
          }}
        >
          The AI didn&rsquo;t get smarter. It got <em>instructed</em>.
        </p>
      </div>
    </section>
  );
}
