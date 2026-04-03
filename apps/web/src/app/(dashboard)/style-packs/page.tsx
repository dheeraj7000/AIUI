import Link from 'next/link';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq, count } from 'drizzle-orm';

export const metadata = { title: 'Style Packs - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getStylePacks() {
  const db = getDb();
  const packs = await db.select().from(stylePacks).orderBy(stylePacks.createdAt);

  const packsWithCounts = await Promise.all(
    packs.map(async (pack) => {
      const [tokenCount] = await db
        .select({ count: count() })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, pack.id));
      const [recipeCount] = await db
        .select({ count: count() })
        .from(componentRecipes)
        .where(eq(componentRecipes.stylePackId, pack.id));
      return {
        ...pack,
        tokenCount: tokenCount?.count ?? 0,
        recipeCount: recipeCount?.count ?? 0,
      };
    })
  );

  return packsWithCounts;
}

const categoryColors: Record<string, string> = {
  saas: 'bg-blue-50 text-blue-700',
  fintech: 'bg-emerald-50 text-emerald-700',
  startup: 'bg-purple-50 text-purple-700',
  'ui-library': 'bg-orange-50 text-orange-700',
  animations: 'bg-pink-50 text-pink-700',
  creative: 'bg-cyan-50 text-cyan-700',
};

export default async function StylePacksPage() {
  const packs = await getStylePacks();
  const categories = ['All', ...new Set(packs.map((p) => p.category))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Style Packs</h1>
      <p className="mt-2 text-sm text-gray-600">
        Browse and apply design styles to your projects. {packs.length} packs available.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <Link
            key={pack.id}
            href={`/style-packs/${pack.id}`}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <span className="text-sm font-medium text-gray-400">v{pack.version}</span>
            </div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[pack.category] ?? 'bg-gray-50 text-gray-700'}`}
            >
              {pack.category}
            </span>
            <h3 className="mt-1 text-base font-semibold text-gray-900">{pack.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{pack.description}</p>
            <div className="mt-3 flex gap-3 text-xs text-gray-400">
              <span>{pack.tokenCount} tokens</span>
              <span>{pack.recipeCount} components</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
