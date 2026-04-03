import { notFound } from 'next/navigation';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { ApplyToProject } from './ApplyToProject';

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

const tokenTypeColors: Record<string, string> = {
  color: 'bg-pink-50 text-pink-700',
  radius: 'bg-blue-50 text-blue-700',
  font: 'bg-amber-50 text-amber-700',
  spacing: 'bg-green-50 text-green-700',
  shadow: 'bg-purple-50 text-purple-700',
  elevation: 'bg-indigo-50 text-indigo-700',
};

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

  return (
    <div>
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

      <div className="mt-8 space-y-6">
        {Object.entries(grouped).map(([type, tokens]) => (
          <div key={type} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${tokenTypeColors[type] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {type}
              </span>
              <span className="text-gray-400 font-normal">{tokens.length} tokens</span>
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2"
                >
                  {type === 'color' && (
                    <div
                      className="h-6 w-6 shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: token.tokenValue }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-gray-700">
                      {token.tokenKey}
                    </div>
                    <div className="truncate text-xs text-gray-400">{token.tokenValue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
