const entries = [
  { figure: '360', label: 'SYSTEM_TOKENS' },
  { figure: '142', label: 'COMPONENT_RECIPES' },
  { figure: '14', label: 'DESIGN_STYLE_PACKS' },
  { figure: '12', label: 'MCP_ENGINE_TOOLS' },
];

export function StatsBar() {
  return (
    <section className="relative border-b border-[var(--rule)]">
      <div className="mx-auto max-w-[1400px]">
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.label}
              className="py-12 px-6 lg:px-12 group transition-colors hover:bg-[var(--paper-deep)]"
              style={{
                borderRight: idx < entries.length - 1 ? '1px solid var(--rule)' : undefined,
              }}
            >
              <dt className="font-mono text-[10px] font-bold text-[var(--ink-muted)] mb-4">
                DATA_NODE_{String(idx + 1).padStart(2, '0')}
              </dt>
              <dd
                className="font-bold tracking-tighter"
                style={{
                  fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}
              >
                {entry.figure}
              </dd>
              <dd className="mt-4 font-mono text-[10px] font-extrabold tracking-widest text-[var(--accent)]">
                {entry.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
