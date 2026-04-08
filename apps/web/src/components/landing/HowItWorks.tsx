import { Palette, Plug, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  detail: string;
}

const steps: Step[] = [
  {
    number: '1',
    title: 'Define your design system',
    description:
      'Import your tokens, pick a style pack, or build from scratch in the visual studio. No credit card required.',
    icon: Palette,
    detail: 'Colors, typography, spacing, components, and rules -- all in one place.',
  },
  {
    number: '2',
    title: 'Connect your IDE',
    description:
      'One command connects Claude, Cursor, or VS Code to your design system. Setup takes under a minute.',
    icon: Plug,
    detail: 'Works with any MCP-compatible AI tool, automatically stays in sync.',
  },
  {
    number: '3',
    title: 'Ship consistent UIs',
    description:
      'Every AI-generated component follows your tokens, patterns, and rules. Your product stays on-brand across every screen.',
    icon: Rocket,
    detail: 'Design decisions persist across all sessions and team members.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Up and running in 3 steps
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            No packages to install. No build plugins to configure. Just your design decisions,
            delivered to Claude.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-0 right-0 hidden lg:block">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-16">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-300 to-blue-400" />
              <div className="h-px flex-1 bg-gradient-to-r from-blue-400 to-violet-400" />
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative text-center lg:text-center">
                  {/* Step number */}
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                    {step.number}
                  </div>
                  <div className="mt-2 inline-flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 max-w-xs mx-auto">
                    {step.description}
                  </p>
                  {step.detail && (
                    <p className="mt-2 text-xs text-gray-400 max-w-xs mx-auto">{step.detail}</p>
                  )}

                  {/* Terminal command for step 2 */}
                  {step.number === '2' && (
                    <div className="mt-5 mx-auto max-w-sm rounded-lg bg-gray-950 p-4 text-left overflow-x-auto shadow-lg">
                      <pre className="text-xs leading-relaxed font-mono">
                        <code>
                          <span className="text-gray-500">$</span>{' '}
                          <span className="text-green-400">claude mcp add aiui</span>
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
