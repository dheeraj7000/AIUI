const steps = [
  {
    number: '01',
    title: 'Choose Your Style',
    description:
      'Select a style pack and customize tokens to match your brand. Adjust colors, fonts, spacing, and shadows.',
  },
  {
    number: '02',
    title: 'Configure Components',
    description:
      'Pick approved component recipes and upload your assets. The design compiler bundles everything together.',
  },
  {
    number: '03',
    title: 'Generate with Confidence',
    description:
      'Claude Code reads your design profile via MCP and produces UI that matches your exact specifications.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          How It Works
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
