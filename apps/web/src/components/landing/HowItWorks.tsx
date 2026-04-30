import * as React from 'react';

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
    title: 'Codify Design Logic',
    body: 'Define your design authority in the studio. AIUI transforms your tokens, recipes, and compliance rules into an orchestration layer Claude reads every session.',
    specimen: (
      <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px] leading-relaxed">
        <div className="flex gap-2">
          <span className="text-[var(--accent)]">WRITE</span>
          <span>.aiui/tokens.json</span>
        </div>
        <div className="mt-1 text-[var(--ink-soft)]">
          {'{ "color.primary": "#0F172A", "radius.md": "2px" }'}
        </div>
      </div>
    ),
    takeaway: 'ONE_SOURCE_OF_TRUTH',
  },
  {
    id: '02',
    title: 'Initialize Protocol',
    body: 'Connect your development environment with a single command. Every AI agent in your project now operates under the same design contract.',
    specimen: (
      <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px] leading-relaxed">
        <div className="flex gap-2">
          <span className="text-[var(--accent)]">EXEC</span>
          <span>claude mcp add aiui</span>
        </div>
        <div className="mt-1 text-[var(--success)]">✓ PROTOCOL_ESTABLISHED</div>
      </div>
    ),
    takeaway: 'ZERO_CONFIGURATION',
  },
  {
    id: '03',
    title: 'Enforce Compliance',
    body: 'Generate UI as usual. The orchestration layer intercepts every generation, ensuring tokens are used and components are correctly bound.',
    specimen: (
      <div className="bg-[var(--paper-sunk)] p-4 border border-[var(--rule)] font-mono text-[10px] leading-relaxed">
        <div className="flex gap-2">
          <span className="text-[var(--accent)]">AUDIT</span>
          <span>Scanning generation [82ms]</span>
        </div>
        <div className="mt-1 text-[var(--success)]">✓ 100% COMPLIANCE</div>
      </div>
    ),
    takeaway: 'AUTONOMOUS_ALIGNMENT',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-b border-[var(--rule)] bg-[var(--paper-deep)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-24 lg:py-40">
        {/* Opener */}
        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <span className="section-numeral">LOGIC_02</span>
            <span className="eyebrow">The Implementation Flow</span>
          </div>
          <h2
            className="display mt-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95 }}
          >
            From design system to <span>agent memory</span>.
          </h2>
          <p className="lede mt-8" style={{ maxWidth: '60ch' }}>
            We don&rsquo;t believe in "hand-offs." We believe in codified authority. Three steps to
            lock your design system into the AI workflow.
          </p>
        </div>

        <div className="mt-24 space-y-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className="grid grid-cols-12 gap-12 bg-[var(--paper)] border border-[var(--rule)] p-12 hover:border-[var(--ink)] transition-colors group"
            >
              <div className="col-span-12 lg:col-span-1 flex flex-col gap-4">
                <span className="font-mono text-xs font-black text-[var(--accent)]">{step.id}</span>
                <div className="h-full w-[2px] bg-[var(--rule)] mx-auto group-hover:bg-[var(--accent)] transition-colors" />
              </div>

              <div className="col-span-12 lg:col-span-5">
                <h3 className="display text-2xl font-bold mb-6">{step.title}</h3>
                <p className="text-[var(--ink-soft)] text-sm leading-relaxed mb-8 max-w-[42ch]">
                  {step.body}
                </p>
                <div className="inline-block px-2 py-1 bg-[var(--accent-soft)] rounded border border-[var(--accent)]">
                  <span className="font-mono text-[9px] font-black text-[var(--accent)]">
                    {step.takeaway}
                  </span>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6">
                <div className="mb-4">{step.specimen}</div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] font-bold text-[var(--ink-muted)] tracking-widest uppercase">
                    SYSLOG_NODE_03_{step.id}
                  </span>
                  <span className="h-[1px] flex-1 bg-[var(--rule)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
