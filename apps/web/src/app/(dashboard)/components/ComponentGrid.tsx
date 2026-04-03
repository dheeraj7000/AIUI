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
  hero: 'bg-violet-50 text-violet-700',
  pricing: 'bg-green-50 text-green-700',
  faq: 'bg-amber-50 text-amber-700',
  footer: 'bg-gray-100 text-gray-700',
  header: 'bg-blue-50 text-blue-700',
  cta: 'bg-rose-50 text-rose-700',
  testimonial: 'bg-cyan-50 text-cyan-700',
  feature: 'bg-indigo-50 text-indigo-700',
  contact: 'bg-teal-50 text-teal-700',
  card: 'bg-orange-50 text-orange-700',
  navigation: 'bg-sky-50 text-sky-700',
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
              ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          All
          <span
            className={`ml-0.5 rounded-full px-1.5 py-px text-[10px] ${
              activeType === 'All' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
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
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <TypeIcon size={12} />
              {t}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-px text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
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
            className="group rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                {recipe.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[recipe.type] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {recipe.type}
                </span>
                {recipe.packName && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
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
          <Puzzle size={32} className="text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No components found for this type.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page info */}
      {filtered.length > ITEMS_PER_PAGE && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of{' '}
          {filtered.length} components
        </p>
      )}
    </>
  );
}
