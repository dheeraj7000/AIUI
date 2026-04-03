import Link from 'next/link';
import { createDb, componentRecipes, stylePacks } from '@aiui/design-core';
import { eq } from 'drizzle-orm';

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

const typeIcons: Record<string, string> = {
  hero: '\u{1F3A8}',
  pricing: '\u{1F4B0}',
  faq: '\u{2753}',
  footer: '\u{1F4CB}',
  header: '\u{1F4DD}',
  cta: '\u{1F4E3}',
  testimonial: '\u{1F4AC}',
  feature: '\u{2728}',
  contact: '\u{1F4E7}',
  card: '\u{1F4C4}',
  navigation: '\u{1F9ED}',
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
        {types.map((t) => (
          <span
            key={t}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/components/${recipe.id}`}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-gray-50 text-3xl">
              {typeIcons[recipe.type] ?? '\u{1F9E9}'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[recipe.type] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {recipe.type}
              </span>
              {recipe.packName && <span className="text-xs text-gray-400">{recipe.packName}</span>}
            </div>
            <h3 className="mt-1 text-base font-semibold text-gray-900">{recipe.name}</h3>
            {recipe.aiUsageRules && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{recipe.aiUsageRules}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
