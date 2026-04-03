const features = [
  {
    title: 'Design Console',
    description:
      'Visual dashboard to configure your design profile. Pick style packs, customize tokens, select components, and upload brand assets.',
    icon: '🎨',
  },
  {
    title: 'Design Compiler',
    description:
      'Tokens, components, and assets compiled into an AI-ready prompt bundle with validation and conflict detection.',
    icon: '⚙️',
  },
  {
    title: 'AI Integration',
    description:
      'MCP server feeds your design decisions directly to Claude Code, so every generated component matches your brand.',
    icon: '🤖',
  },
  {
    title: 'Validation',
    description:
      'Detect style drift, enforce token compliance, and catch unauthorized components in AI-generated code.',
    icon: '✅',
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Four Layers of Design Control
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
