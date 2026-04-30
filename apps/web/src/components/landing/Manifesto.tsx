export function Manifesto() {
  return (
    <section
      aria-label="Manifesto"
      className="bg-[var(--ink)] text-[var(--paper)] border-b border-white/5"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-32 lg:py-48">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-2">
            <span className="font-mono text-[10px] font-black text-[var(--accent)] tracking-[0.2em] uppercase">
              SYSTEM_MANIFESTO
            </span>
          </div>

          <div className="col-span-12 lg:col-span-10">
            <h2
              className="display"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: '-0.06em',
              }}
            >
              This entire environment is <br />
              <span className="text-[var(--accent)]">orchestrated by protocol</span>.
            </h2>

            <div className="mt-16 space-y-8 max-w-4xl">
              <p className="text-xl lg:text-2xl font-semibold tracking-tight leading-tight text-white/90">
                Every pixel on this page was generated using the same AIUI orchestration pack
                you&rsquo;ll deploy to production. No unmanaged drift. No local overrides. No AI
                guessing what the brand means.
              </p>

              <p
                className="font-mono text-xs leading-relaxed text-white/40 uppercase tracking-widest"
                style={{ maxWidth: '65ch' }}
              >
                Initialization time: 90 seconds. Result: Persistent architectural compliance across
                every conversation, every contributor, and every model iteration. The age of manual
                hand-offs is over. The era of codified design authority has begun.
              </p>
            </div>

            <div className="mt-20 flex items-center gap-4">
              <div className="h-[1px] w-20 bg-[var(--accent)]" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent)] tracking-[0.3em]">
                ORCHESTRATION_LAYER_ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
