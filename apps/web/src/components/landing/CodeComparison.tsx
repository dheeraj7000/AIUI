export function CodeComparison() {
  return (
    <section className="relative border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-24 lg:py-40">
        {/* Opener */}
        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <span className="section-numeral">LOGIC_03</span>
            <span className="eyebrow">The Performance Gap</span>
          </div>
          <h2
            className="display mt-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95 }}
          >
            Same prompt. Same model. <span>Orchestrated output</span>.
          </h2>
          <p className="lede mt-8" style={{ maxWidth: '60ch' }}>
            The only variable between these two generations is whether AIUI was active. On the left,
            the agent invents. On the right, it complies.
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-1 bg-[var(--rule)] border border-[var(--rule)]">
          {/* Left — Unmanaged */}
          <div className="bg-[var(--paper)] p-12">
            <div className="flex items-center justify-between mb-10">
              <span className="font-mono text-[10px] font-bold text-red-500 uppercase tracking-widest">
                UNMANAGED_GENERATION
              </span>
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>

            <h3 className="display text-xl font-bold mb-6">Prompt: Build me a settings page.</h3>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed mb-10 max-w-[40ch]">
              Hardcoded hex values. Random border radii. Arbitrary padding. This is the "design
              drift" that kills production systems.
            </p>

            <div className="bg-[#0F172A] p-6 rounded-lg font-mono text-[11px] leading-relaxed shadow-xl border border-white/10">
              <div className="text-white/40 mb-4 border-b border-white/5 pb-2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400/20" />
                <div className="w-2 h-2 rounded-full bg-red-400/20" />
                <div className="w-2 h-2 rounded-full bg-red-400/20" />
              </div>
              <div className="text-blue-300">
                {'<'}div style={'{{'} padding: 20 {'}}'}
                {'>'}
              </div>
              <div className="text-blue-300 pl-4">
                {'<'}h1 style={'{{'} fontSize: 24, color:{' '}
                <span className="text-pink-400">"navy"</span> {'}}'}
                {'>'}
              </div>
              <div className="text-white/80 pl-8">Settings</div>
              <div className="text-blue-300 pl-4">
                {'</'}h1{'>'}
              </div>
              <div className="text-blue-300 pl-4">
                {'<'}button style={'{{'} background:{' '}
                <span className="text-pink-400">"cornflowerblue"</span>, padding:{' '}
                <span className="text-pink-400">"8px 16px"</span> {'}}'}
                {'>'}
              </div>
              <div className="text-white/80 pl-8">Save Changes</div>
              <div className="text-blue-300 pl-4">
                {'</'}button{'>'}
              </div>
              <div className="text-blue-300">
                {'</'}div{'>'}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold text-red-500/50 tracking-widest">
                DRIFT_DETECTED_100%
              </span>
              <span className="h-[1px] flex-1 bg-[var(--rule)] opacity-50" />
            </div>
          </div>

          {/* Right — Orchestrated */}
          <div className="bg-[var(--paper)] p-12">
            <div className="flex items-center justify-between mb-10">
              <span className="font-mono text-[10px] font-bold text-[var(--success)] uppercase tracking-widest">
                ORCHESTRATED_GENERATION
              </span>
              <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
            </div>

            <h3 className="display text-xl font-bold mb-6">Prompt: Build me a settings page.</h3>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed mb-10 max-w-[40ch]">
              Zero drift. Every decision is mapped to your approved tokens and component library.
              The agent follows the established protocol.
            </p>

            <div className="bg-[#0F172A] p-6 rounded-lg font-mono text-[11px] leading-relaxed shadow-xl border border-white/10">
              <div className="text-white/40 mb-4 border-b border-white/5 pb-2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400/20" />
                <div className="w-2 h-2 rounded-full bg-green-400/20" />
                <div className="w-2 h-2 rounded-full bg-green-400/20" />
              </div>
              <div className="text-blue-300">
                {'<'}Page title=<span className="text-green-400">"Settings"</span>
                {'>'}
              </div>
              <div className="text-blue-300 pl-4">
                {'<'}Heading level=<span className="text-green-400">"page"</span>
                {'>'}Settings{'</'}Heading{'>'}
              </div>
              <div className="text-blue-300 pl-4">
                {'<'}Stack gap=<span className="text-green-400">"space.6"</span>
                {'>'}
              </div>
              <div className="text-white/40 pl-8">{'/* fields orchestrated */'}</div>
              <div className="text-blue-300 pl-8">
                {'<'}Button variant=<span className="text-green-400">"primary"</span> size=
                <span className="text-green-400">"md"</span>
                {'>'}
              </div>
              <div className="text-white/80 pl-12">Save changes</div>
              <div className="text-blue-300 pl-8">
                {'</'}Button{'>'}
              </div>
              <div className="text-blue-300 pl-4">
                {'</'}Stack{'>'}
              </div>
              <div className="text-blue-300">
                {'</'}Page{'>'}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold text-[var(--success)] tracking-widest">
                COMPLIANCE_VERIFIED_100%
              </span>
              <span className="h-[1px] flex-1 bg-[var(--rule)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
