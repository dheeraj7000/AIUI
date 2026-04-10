import { notFound } from 'next/navigation';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { Palette, Type, Circle, Layers, Move, BoxSelect } from 'lucide-react';
import { ApplyToProject } from './ApplyToProject';
import { TokenPreview } from '@/components/ui/TokenPreview';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getStylePack(id: string) {
  const db = getDb();
  const [pack] = await db.select().from(stylePacks).where(eq(stylePacks.id, id)).limit(1);
  if (!pack) return null;

  const tokens = await db
    .select()
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, id))
    .orderBy(styleTokens.tokenType, styleTokens.tokenKey);

  const recipes = await db
    .select({ id: componentRecipes.id, name: componentRecipes.name, type: componentRecipes.type })
    .from(componentRecipes)
    .where(eq(componentRecipes.stylePackId, id))
    .orderBy(componentRecipes.name);

  return { ...pack, tokens, recipes };
}

const sectionMeta: Record<string, { label: string; badge: string; icon: typeof Palette }> = {
  color: {
    label: 'Colors',
    badge: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    icon: Palette,
  },
  font: {
    label: 'Typography',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    icon: Type,
  },
  radius: {
    label: 'Border Radius',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: Circle,
  },
  shadow: {
    label: 'Shadows',
    badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    icon: Layers,
  },
  spacing: {
    label: 'Spacing',
    badge: 'bg-green-500/10 text-green-400 border border-green-500/20',
    icon: Move,
  },
  elevation: {
    label: 'Elevation',
    badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    icon: BoxSelect,
  },
};

/** Display order for token-type sections. */
const sectionOrder = ['color', 'font', 'radius', 'shadow', 'elevation', 'spacing'];

type RouteContext = { params: Promise<{ id: string }> };

export default async function StylePackDetailPage(props: RouteContext) {
  const { id } = await props.params;
  const pack = await getStylePack(id);
  if (!pack) notFound();

  // Group tokens by type
  const grouped = pack.tokens.reduce<Record<string, typeof pack.tokens>>((acc, t) => {
    (acc[t.tokenType] ??= []).push(t);
    return acc;
  }, {});

  // Derive fonts for the typography sample
  const headingFont = grouped['font']?.find((t) => t.tokenKey.includes('heading'))?.tokenValue;
  const bodyFont = grouped['font']?.find((t) => t.tokenKey.includes('body'))?.tokenValue;

  // Derive a bg + text color pair for the color section sample
  const bgColor = grouped['color']?.find((t) => t.tokenKey.includes('background'))?.tokenValue;
  const textColor = grouped['color']?.find((t) => t.tokenKey.includes('text-primary'))?.tokenValue;

  const orderedTypes = sectionOrder.filter((t) => grouped[t]);
  // Append any types not in the predefined order
  for (const t of Object.keys(grouped)) {
    if (!orderedTypes.includes(t)) orderedTypes.push(t);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{pack.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">{pack.description}</p>
          <div className="mt-2 flex gap-2 text-xs text-zinc-500">
            <span>{pack.category}</span>
            <span>v{pack.version}</span>
            <span>{pack.tokens.length} tokens</span>
            <span>{pack.recipes.length} components</span>
          </div>
        </div>
        <ApplyToProject stylePackId={pack.id} />
      </div>

      {/* Token sections */}
      <div className="mt-8 space-y-6">
        {orderedTypes.map((type) => {
          const tokens = grouped[type]!;
          const meta = sectionMeta[type] ?? {
            label: type,
            badge: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
            icon: Layers,
          };
          const SectionIcon = meta.icon;

          return (
            <div
              key={type}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5"
            >
              {/* Section header */}
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <SectionIcon size={14} className="text-zinc-400" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
                  {meta.label}
                </span>
                <span className="font-normal text-zinc-500">{tokens.length} tokens</span>
              </h2>

              {/* --- Colors: grid of swatches --- */}
              {type === 'color' && (
                <>
                  <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-5 lg:grid-cols-6">
                    {tokens.map((token) => (
                      <TokenPreview
                        key={token.id}
                        tokenKey={token.tokenKey}
                        tokenType={token.tokenType}
                        tokenValue={token.tokenValue}
                      />
                    ))}
                  </div>
                  {/* Sample: text on bg */}
                  {bgColor && textColor && (
                    <div
                      className="mt-4 rounded-lg px-5 py-4"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      <p className="text-sm font-medium">Text on background sample</p>
                      <p className="mt-1 text-xs opacity-70">
                        Background: {bgColor} &middot; Text: {textColor}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* --- Typography: font samples --- */}
              {type === 'font' && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-6">
                    {tokens.map((token) => (
                      <TokenPreview
                        key={token.id}
                        tokenKey={token.tokenKey}
                        tokenType={token.tokenType}
                        tokenValue={token.tokenValue}
                      />
                    ))}
                  </div>
                  {/* Extended text samples */}
                  <div className="space-y-3 rounded-lg border border-white/5 bg-white/[0.03] p-4">
                    {headingFont && (
                      <p
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: headingFont }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                    )}
                    {bodyFont && (
                      <p
                        className="text-sm leading-relaxed text-zinc-400"
                        style={{ fontFamily: bodyFont }}
                      >
                        The quick brown fox jumps over the lazy dog. Pack my box with five dozen
                        liquor jugs. How vexingly quick daft zebras jump.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* --- Radius: row of boxes --- */}
              {type === 'radius' && (
                <div className="mt-4 flex flex-wrap gap-6">
                  {tokens.map((token) => (
                    <TokenPreview
                      key={token.id}
                      tokenKey={token.tokenKey}
                      tokenType={token.tokenType}
                      tokenValue={token.tokenValue}
                    />
                  ))}
                </div>
              )}

              {/* --- Shadow: row of cards --- */}
              {type === 'shadow' && (
                <div className="mt-4 flex flex-wrap gap-6">
                  {tokens.map((token) => (
                    <TokenPreview
                      key={token.id}
                      tokenKey={token.tokenKey}
                      tokenType={token.tokenType}
                      tokenValue={token.tokenValue}
                    />
                  ))}
                </div>
              )}

              {/* --- Elevation: row of cards with gradient --- */}
              {type === 'elevation' && (
                <div className="mt-4 flex flex-wrap gap-6">
                  {tokens.map((token) => (
                    <TokenPreview
                      key={token.id}
                      tokenKey={token.tokenKey}
                      tokenType={token.tokenType}
                      tokenValue={token.tokenValue}
                    />
                  ))}
                </div>
              )}

              {/* --- Spacing: visual bars --- */}
              {type === 'spacing' && (
                <div className="mt-4 space-y-2">
                  {tokens.map((token) => (
                    <TokenPreview
                      key={token.id}
                      tokenKey={token.tokenKey}
                      tokenType={token.tokenType}
                      tokenValue={token.tokenValue}
                    />
                  ))}
                </div>
              )}

              {/* --- Fallback for unknown types --- */}
              {!sectionMeta[type] && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tokens.map((token) => (
                    <TokenPreview
                      key={token.id}
                      tokenKey={token.tokenKey}
                      tokenType={token.tokenType}
                      tokenValue={token.tokenValue}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Component recipes */}
      {pack.recipes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">Components in this pack</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pack.recipes.map((r) => (
              <a
                key={r.id}
                href={`/components/${r.id}`}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-sm transition-all duration-200 hover:bg-white/[0.04] hover:border-white/10"
              >
                <span className="font-medium text-white">{r.name}</span>
                <span className="ml-2 text-xs text-zinc-500">{r.type}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
