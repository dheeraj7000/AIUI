import Link from 'next/link';
import { createDb, componentRecipes, stylePacks } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
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
  Bot,
  type LucideIcon,
} from 'lucide-react';

export const metadata = { title: 'Components - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getRecipes() {
  const db = getDb();
  const recipes = await db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      slug: componentRecipes.slug,
      type: componentRecipes.type,
      aiUsageRules: componentRecipes.aiUsageRules,
      stylePackId: componentRecipes.stylePackId,
      packName: stylePacks.name,
      packCategory: stylePacks.category,
    })
    .from(componentRecipes)
    .leftJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
    .orderBy(componentRecipes.name);

  return recipes;
}

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

const typeIconBgs: Record<string, string> = {
  hero: 'bg-violet-100',
  pricing: 'bg-green-100',
  faq: 'bg-amber-100',
  footer: 'bg-gray-200',
  header: 'bg-blue-100',
  cta: 'bg-rose-100',
  testimonial: 'bg-cyan-100',
  feature: 'bg-indigo-100',
  contact: 'bg-teal-100',
  card: 'bg-orange-100',
  navigation: 'bg-sky-100',
};

export default async function ComponentBrowserPage() {
  const recipes = await getRecipes();
  const types = ['All', ...new Set(recipes.map((r) => r.type))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Components</h1>
      <p className="mt-2 text-sm text-gray-600">
        Browse {recipes.length} component recipes from your design library.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {types.map((t) => {
          const TypeIcon = typeIcons[t] ?? Puzzle;
          return (
            <span
              key={t}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
            >
              {t !== 'All' && <TypeIcon size={12} />}
              {t}
            </span>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const Icon = typeIcons[recipe.type] ?? Puzzle;
          const iconBg = typeIconBgs[recipe.type] ?? 'bg-gray-100';
          const iconColor = typeColors[recipe.type]?.split(' ')[1] ?? 'text-gray-600';
          return (
            <Link
              key={recipe.id}
              href={`/components/${recipe.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-3 flex h-28 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon size={32} className={iconColor} strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[recipe.type] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {recipe.type}
                </span>
                {recipe.packName && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
                    {recipe.packName}
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-gray-900">{recipe.name}</h3>
              {recipe.aiUsageRules && (
                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-blue-50/50 px-2 py-1.5">
                  <Bot size={14} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="line-clamp-2 text-xs text-blue-700">{recipe.aiUsageRules}</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
