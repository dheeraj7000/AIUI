export function Manifesto() {
  return (
    <section
      aria-label="Manifesto"
      style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
      }}
    >
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-28 lg:py-40">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span
              className="display"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: 1,
                color: 'var(--accent-soft)',
                fontVariantNumeric: 'oldstyle-nums',
                opacity: 0.7,
              }}
            >
              &para;
            </span>
          </div>

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <span className="eyebrow" style={{ color: 'var(--paper-deep)', opacity: 0.7 }}>
              A note from the typesetter
            </span>

            <p
              className="display mt-6"
              style={{
                fontSize: 'clamp(1.75rem, 3.4vw, 2.875rem)',
                lineHeight: 1.18,
                color: 'var(--paper)',
                maxWidth: '28ch',
                fontWeight: 500,
              }}
            >
              This page is typeset with the same AIUI pack you&rsquo;ll ship on Tuesday.
              <br />
              <em style={{ color: 'var(--accent-soft)' }}>
                No drift. No template. No AI deciding what the brand is.
              </em>
            </p>

            <p
              className="mt-8 text-[0.875rem]"
              style={{
                fontFamily: 'var(--font-mono-editorial)',
                color: 'var(--paper-deep)',
                opacity: 0.75,
                letterSpacing: '0.04em',
                maxWidth: '60ch',
                lineHeight: 1.6,
              }}
            >
              From the moment you copy the install command to the first compliant component the AI
              writes back: ninety seconds, measured. Everything past that — every screen, every
              week, every new contributor, every new model — inherits exactly what you see here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
