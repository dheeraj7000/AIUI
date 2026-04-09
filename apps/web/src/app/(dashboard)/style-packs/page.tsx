import Link from 'next/link';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq, count, inArray, or } from 'drizzle-orm';
import {
  Layers,
  LayoutGrid,
  Sparkles,
  Zap,
  Globe,
  Paintbrush,
  Puzzle,
  Download,
} from 'lucide-react';
import { TokenStrip } from '@/components/ui/TokenPreview';
import { getUserOrg } from '@/lib/get-user-org';

export const metadata = { title: 'Style Packs - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getStylePacks() {
  const db = getDb();
  const userOrg = await getUserOrg();
  const orgId = userOrg?.organizationId;

  // Show packs belonging to the user's org OR public packs (seed data)
  const packs = orgId
    ? await db
        .select()
        .from(stylePacks)
        .where(or(eq(stylePacks.organizationId, orgId), eq(stylePacks.isPublic, true)))
        .orderBy(stylePacks.createdAt)
    : await db
        .select()
        .from(stylePacks)
        .where(eq(stylePacks.isPublic, true))
        .orderBy(stylePacks.createdAt);

  // Fetch preview tokens for all packs in one query (color, font, radius types)
  const packIds = packs.map((p) => p.id);
  const previewTokens =
    packIds.length > 0
      ? await db
          .select({
            stylePackId: styleTokens.stylePackId,
            tokenKey: styleTokens.tokenKey,
            tokenType: styleTokens.tokenType,
            tokenValue: styleTokens.tokenValue,
          })
          .from(styleTokens)
          .where(inArray(styleTokens.stylePackId, packIds))
      : [];

  // Group preview tokens by pack id (keep only types useful for strip)
  const stripTypes = new Set(['color', 'font', 'radius']);
  const tokensByPack = new Map<string, typeof previewTokens>();
  for (const t of previewTokens) {
    if (!stripTypes.has(t.tokenType)) continue;
    const arr = tokensByPack.get(t.stylePackId) ?? [];
    arr.push(t);
    tokensByPack.set(t.stylePackId, arr);
  }

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
        previewTokens: tokensByPack.get(pack.id) ?? [],
      };
    })
  );

  return packsWithCounts;
}

const categoryColors: Record<string, string> = {
  saas: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fintech: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  startup: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'ui-library': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  animations: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  creative: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const categoryIcons: Record<string, typeof Layers> = {
  saas: Globe,
  fintech: Layers,
  startup: Zap,
  'ui-library': LayoutGrid,
  animations: Sparkles,
  creative: Paintbrush,
};

export default async function StylePacksPage() {
  const packs = await getStylePacks();
  const categories = ['All', ...new Set(packs.map((p) => p.category))];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Style Packs</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Browse and apply design styles to your projects. {packs.length} packs available.
          </p>
        </div>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition-colors hover:bg-lime-400"
        >
          <Download size={16} />
          Import Design
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const CatIcon = categoryIcons[cat] ?? Puzzle;
          return (
            <span
              key={cat}
              className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:shadow-sm"
            >
              {cat !== 'All' && <CatIcon size={12} />}
              {cat}
            </span>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          return (
            <Link
              key={pack.id}
              href={`/style-packs/${pack.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <TokenStrip tokens={pack.previewTokens} />
              <div className="p-5">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${categoryColors[pack.category] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                >
                  {pack.category}
                </span>
                <h3 className="mt-1.5 text-base font-semibold text-white">{pack.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{pack.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Layers size={12} />
                    {pack.tokenCount} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <Puzzle size={12} />
                    {pack.recipeCount} components
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
