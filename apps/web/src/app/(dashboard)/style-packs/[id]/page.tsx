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
  color: { label: 'Colors', badge: 'bg-pink-50 text-pink-700', icon: Palette },
  font: { label: 'Typography', badge: 'bg-amber-50 text-amber-700', icon: Type },
  radius: { label: 'Border Radius', badge: 'bg-blue-50 text-blue-700', icon: Circle },
  shadow: { label: 'Shadows', badge: 'bg-purple-50 text-purple-700', icon: Layers },
  spacing: { label: 'Spacing', badge: 'bg-green-50 text-green-700', icon: Move },
  elevation: { label: 'Elevation', badge: 'bg-indigo-50 text-indigo-700', icon: BoxSelect },
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
          <h1 className="text-2xl font-bold text-gray-900">{pack.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{pack.description}</p>
          <div className="mt-2 flex gap-2 text-xs text-gray-400">
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
            badge: 'bg-gray-100 text-gray-700',
            icon: Layers,
          };
          const SectionIcon = meta.icon;

          return (
            <div key={type} className="rounded-lg border border-gray-200 bg-white p-5">
              {/* Section header */}
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <SectionIcon size={14} className="text-gray-400" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
                  {meta.label}
                </span>
                <span className="font-normal text-gray-400">{tokens.length} tokens</span>
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
                  <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    {headingFont && (
                      <p
                        className="text-xl font-bold text-gray-900"
                        style={{ fontFamily: headingFont }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                    )}
                    {bodyFont && (
                      <p
                        className="text-sm leading-relaxed text-gray-600"
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
          <h2 className="text-lg font-semibold text-gray-900">Components in this pack</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pack.recipes.map((r) => (
              <a
                key={r.id}
                href={`/components/${r.id}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:shadow-sm"
              >
                <span className="font-medium text-gray-900">{r.name}</span>
                <span className="ml-2 text-xs text-gray-400">{r.type}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
