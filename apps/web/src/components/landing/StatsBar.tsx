const entries = [
  { figure: '360', label: 'Design tokens' },
  { figure: '142', label: 'Component recipes' },
  { figure: '14', label: 'Style packs' },
  { figure: '12', label: 'MCP tools' },
];

export function StatsBar() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div
          className="flex items-baseline gap-3 py-3"
          style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
        >
          <span className="eyebrow shrink-0">By the numbers</span>
          <span className="leader" aria-hidden />
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.label}
              className="py-8 md:py-10"
              style={{
                borderBottom: '1px solid var(--rule)',
                borderRight: idx < entries.length - 1 ? '1px solid var(--rule)' : undefined,
                paddingLeft: idx === 0 ? 0 : '1.5rem',
                paddingRight: '1.5rem',
              }}
            >
              <dt className="eyebrow" style={{ fontSize: '0.6875rem' }}>
                § {String(idx + 1).padStart(2, '0')}
              </dt>
              <dd
                className="display mt-3"
                style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.75rem)',
                  lineHeight: 1,
                  fontVariantNumeric: 'oldstyle-nums',
                  color: 'var(--ink)',
                }}
              >
                {entry.figure}
              </dd>
              <dd className="mt-2 text-[0.875rem]" style={{ color: 'var(--ink-muted)' }}>
                {entry.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
