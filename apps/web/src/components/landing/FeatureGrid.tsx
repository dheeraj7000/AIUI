import { Palette, LayoutGrid, Brain, ShieldCheck, Wand2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    title: 'Style Packs',
    description:
      '14 curated design systems with 360+ tokens covering colors, typography, spacing, shadows, and radii.',
    icon: Palette,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    title: 'Component Recipes',
    description:
      '142 code templates with props, variants, and AI usage rules that Claude follows precisely.',
    icon: LayoutGrid,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Design Memory',
    description:
      'Persistent .aiui/ files Claude reads every conversation, so your design decisions stick across sessions.',
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    title: 'Token Compliance',
    description:
      'Validates generated code against your approved tokens. Catches style drift before it reaches production.',
    icon: ShieldCheck,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Visual Studio',
    description:
      'Pick your style pack and components in one guided flow. Preview tokens and export your config instantly.',
    icon: Wand2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'Quick Setup',
    description:
      'Get your API key, paste one config block, and start building. CLI-free onboarding in under 60 seconds.',
    icon: Zap,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-zinc-950 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-lime-400">Features</p>
          <h2 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Everything you need to control AI-generated UI
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">
            From design tokens to full component recipes, AIUI gives Claude the context it needs to
            build UI your way.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-lg hover:shadow-lime-500/5"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
