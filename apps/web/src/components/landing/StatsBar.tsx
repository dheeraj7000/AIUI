const stats = [
  { value: '360+', label: 'Design tokens' },
  { value: '142', label: 'Component recipes' },
  { value: '14', label: 'Style packs' },
  { value: '12', label: 'MCP tools' },
];

export function StatsBar() {
  return (
    <section className="bg-zinc-900 border-y border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
