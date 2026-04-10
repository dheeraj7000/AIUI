'use client';

import { StaggerContainer, StaggerChild } from './motion';
import { Layers, LayoutGrid, Palette, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const stats: Stat[] = [
  { value: '360+', label: 'Design tokens', icon: Layers, color: 'text-lime-400' },
  { value: '142', label: 'Component recipes', icon: LayoutGrid, color: 'text-cyan-400' },
  { value: '14', label: 'Style packs', icon: Palette, color: 'text-violet-400' },
  { value: '12', label: 'MCP tools', icon: Wrench, color: 'text-amber-400' },
];

export function StatsBar() {
  return (
    <section className="relative bg-zinc-950 border-y border-white/5">
      <div className="absolute inset-0 bg-aurora-subtle" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerChild key={stat.label}>
                <div className="group text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-colors group-hover:bg-white/10">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-500">{stat.label}</div>
                </div>
              </StaggerChild>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
