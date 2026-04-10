'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ComponentPreviewCard } from '@/components/ui/ComponentPreview';
import {
  Image,
  DollarSign,
  HelpCircle,
  PanelBottom,
  FileText,
  Megaphone,
  MessageSquare,
  Sparkles,
  Mail,
  CreditCard,
  Navigation,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const typeIcons: Record<string, LucideIcon> = {
  hero: Image,
  pricing: DollarSign,
  faq: HelpCircle,
  footer: PanelBottom,
  header: FileText,
  cta: Megaphone,
  testimonial: MessageSquare,
  feature: Sparkles,
  contact: Mail,
  card: CreditCard,
  navigation: Navigation,
};

const typeColors: Record<string, string> = {
  hero: 'bg-violet-500/10 text-violet-400',
  pricing: 'bg-green-500/10 text-green-400',
  faq: 'bg-amber-500/10 text-amber-400',
  footer: 'bg-zinc-800 text-zinc-300',
  header: 'bg-blue-500/10 text-blue-400',
  cta: 'bg-rose-500/10 text-rose-400',
  testimonial: 'bg-cyan-500/10 text-cyan-400',
  feature: 'bg-indigo-500/10 text-indigo-400',
  contact: 'bg-teal-500/10 text-teal-400',
  card: 'bg-orange-500/10 text-orange-400',
  navigation: 'bg-sky-500/10 text-sky-400',
};

export interface RecipeItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  codeTemplate: string;
  jsonSchema: unknown;
  aiUsageRules: string | null;
  stylePackId: string;
  packName: string | null;
  packCategory: string | null;
  primaryColor?: string;
  colors?: {
    primary?: string;
    bg?: string;
    text?: string;
    accent?: string;
  };
}

interface ComponentGridProps {
  recipes: RecipeItem[];
}

export function ComponentGrid({ recipes }: ComponentGridProps) {
  const [activeType, setActiveType] = useState('All');
  const [page, setPage] = useState(1);

  // Derive the unique types and counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of recipes) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    }
    return counts;
  }, [recipes]);

  const types = useMemo(() => {
    const unique = [...new Set(recipes.map((r) => r.type))];
    // Sort alphabetically for consistent ordering
    unique.sort();
    return unique;
  }, [recipes]);

  // Filter by active type
  const filtered = useMemo(() => {
    if (activeType === 'All') return recipes;
    return recipes.filter((r) => r.type === activeType);
  }, [recipes, activeType]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  // Reset to page 1 when type changes
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setPage(1);
  };

  return (
    <>
      {/* Category tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {/* All tab */}
        <button
          onClick={() => handleTypeChange('All')}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            activeType === 'All'
              ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:shadow-sm'
          }`}
        >
          All
          <span
            className={`ml-0.5 rounded-full px-1.5 py-px text-[10px] ${
              activeType === 'All' ? 'bg-black/20 text-white' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {recipes.length}
          </span>
        </button>

        {types.map((t) => {
          const TypeIcon = typeIcons[t] ?? Puzzle;
          const isActive = activeType === t;
          return (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:shadow-sm'
              }`}
            >
              <TypeIcon size={12} />
              {t}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-px text-[10px] ${
                  isActive ? 'bg-black/20 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {typeCounts[t] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/components/${recipe.id}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Visual preview thumbnail */}
            <div className="p-3 pb-0">
              <ComponentPreviewCard
                codeTemplate={recipe.codeTemplate}
                type={recipe.type}
                name={recipe.name}
                jsonSchema={recipe.jsonSchema}
                primaryColor={recipe.primaryColor}
              />
            </div>

            {/* Info */}
            <div className="px-4 pb-4 pt-3">
              <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200">
                {recipe.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[recipe.type] ?? 'bg-zinc-800 text-zinc-400'}`}
                >
                  {recipe.type}
                </span>
                {recipe.packName && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-zinc-600" />
                    {recipe.packName}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {pageItems.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <Puzzle size={32} className="text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400">No components found for this type.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  p === safePage
                    ? 'bg-indigo-500 text-white'
                    : 'border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page info */}
      {filtered.length > ITEMS_PER_PAGE && (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of{' '}
          {filtered.length} components
        </p>
      )}
    </>
  );
}
