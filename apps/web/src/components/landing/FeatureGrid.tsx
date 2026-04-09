'use client';

import { Palette, LayoutGrid, Brain, ShieldCheck, Wand2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerChild } from './motion';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  span?: string; // grid span class for bento layout
}

const features: Feature[] = [
  {
    title: 'Style Packs',
    description:
      '14 curated design systems with 360+ tokens covering colors, typography, spacing, shadows, and radii. Pick one and ship with a cohesive look from day one.',
    icon: Palette,
    color: 'text-pink-400',
    glowColor: 'group-hover:shadow-pink-500/20',
    span: 'md:col-span-2',
  },
  {
    title: 'Component Recipes',
    description:
      '142 code templates with props, variants, and AI usage rules that Claude follows precisely.',
    icon: LayoutGrid,
    color: 'text-blue-400',
    glowColor: 'group-hover:shadow-blue-500/20',
  },
  {
    title: 'Design Memory',
    description:
      'Persistent .aiui/ files Claude reads every conversation, so your design decisions stick across sessions.',
    icon: Brain,
    color: 'text-violet-400',
    glowColor: 'group-hover:shadow-violet-500/20',
  },
  {
    title: 'Token Compliance',
    description:
      'Validates generated code against your approved tokens. Catches style drift before it reaches production.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    glowColor: 'group-hover:shadow-emerald-500/20',
  },
  {
    title: 'Visual Studio',
    description:
      'Pick your style pack and components in one guided flow. Preview tokens and export your config instantly.',
    icon: Wand2,
    color: 'text-amber-400',
    glowColor: 'group-hover:shadow-amber-500/20',
  },
  {
    title: 'Quick Setup',
    description:
      'Get your API key, paste one config block, and start building. CLI-free onboarding in under 60 seconds.',
    icon: Zap,
    color: 'text-cyan-400',
    glowColor: 'group-hover:shadow-cyan-500/20',
    span: 'md:col-span-2',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative bg-zinc-950 py-24 sm:py-32 noise-overlay">
      <div className="absolute inset-0 bg-aurora-subtle" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
              Features
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Everything you need to control{' '}
              <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
                AI-generated UI
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              From design tokens to full component recipes, AIUI gives Claude the context it needs
              to build UI your way.
            </p>
          </div>
        </FadeUp>

        {/* Bento grid */}
        <StaggerContainer className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerChild key={feature.title} className={feature.span ?? ''}>
                <div
                  className={`group relative h-full rounded-2xl glass-card glass-card-hover p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.glowColor}`}
                >
                  {/* Icon with glow */}
                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-colors duration-300 group-hover:bg-white/10 group-hover:border-white/10">
                      <Icon
                        className={`h-5.5 w-5.5 ${feature.color} transition-transform duration-300 group-hover:scale-110`}
                      />
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.description}</p>

                  {/* Subtle shimmer on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 shimmer" />
                  </div>
                </div>
              </StaggerChild>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
