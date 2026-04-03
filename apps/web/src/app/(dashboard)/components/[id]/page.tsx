import { notFound } from 'next/navigation';
import { createDb, componentRecipes, stylePacks, styleTokens } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { Bot } from 'lucide-react';
import { AddToProject } from './AddToProject';
import { CopyButton } from './CopyButton';
import { ComponentPreview } from '@/components/ui/ComponentPreview';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getRecipe(id: string) {
  const db = getDb();
  const [recipe] = await db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      slug: componentRecipes.slug,
      type: componentRecipes.type,
      codeTemplate: componentRecipes.codeTemplate,
      jsonSchema: componentRecipes.jsonSchema,
      aiUsageRules: componentRecipes.aiUsageRules,
      stylePackId: componentRecipes.stylePackId,
      packName: stylePacks.name,
    })
    .from(componentRecipes)
    .leftJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
    .where(eq(componentRecipes.id, id))
    .limit(1);

  if (!recipe) return null;

  // Fetch ALL tokens for this pack (used by live preview)
  let packTokens: Array<{ tokenKey: string; tokenType: string; tokenValue: string }> = [];
  let primaryColor: string | undefined;
  if (recipe.stylePackId) {
    packTokens = await db
      .select({
        tokenKey: styleTokens.tokenKey,
        tokenType: styleTokens.tokenType,
        tokenValue: styleTokens.tokenValue,
      })
      .from(styleTokens)
      .where(eq(styleTokens.stylePackId, recipe.stylePackId));

    primaryColor = packTokens.find((t) => t.tokenKey === 'color.primary')?.tokenValue;
  }

  return { ...recipe, packTokens, primaryColor };
}

/** Parse a JSON Schema object into a flat list of property rows. */
function extractSchemaProperties(
  schema: Record<string, unknown>
): Array<{ name: string; type: string; default: string; description: string }> {
  const props = (schema?.properties as Record<string, Record<string, unknown>> | undefined) ?? {};
  const required = Array.isArray(schema?.required) ? (schema.required as string[]) : [];

  return Object.entries(props).map(([key, def]) => {
    let typeStr = String(def?.type ?? 'unknown');
    if (required.includes(key)) typeStr += ' (required)';

    const defaultVal = def?.default !== undefined ? JSON.stringify(def.default) : '\u2014';

    const desc = String(def?.description ?? '');

    return { name: key, type: typeStr, default: defaultVal, description: desc };
  });
}

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

type RouteContext = { params: Promise<{ id: string }> };

export default async function ComponentDetailPage(props: RouteContext) {
  const { id } = await props.params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const schemaObj = recipe.jsonSchema as Record<string, unknown> | null;
  const schemaRows = schemaObj ? extractSchemaProperties(schemaObj) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-sm">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[recipe.type] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {recipe.type}
            </span>
            {recipe.packName && (
              <span className="text-xs text-gray-400">from {recipe.packName}</span>
            )}
          </div>
        </div>
        <AddToProject recipeId={recipe.id} />
      </div>

      {/* Visual preview */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <ComponentPreview
          codeTemplate={recipe.codeTemplate}
          type={recipe.type}
          name={recipe.name}
          jsonSchema={recipe.jsonSchema}
          tokens={recipe.packTokens}
          primaryColor={recipe.primaryColor}
          large
        />
      </div>

      {/* AI Usage Rules */}
      {recipe.aiUsageRules && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Bot size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-blue-900">AI Usage Rules</h2>
            <p className="mt-1 text-sm leading-relaxed text-blue-800">{recipe.aiUsageRules}</p>
          </div>
        </div>
      )}

      {/* Code Template */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-700/50 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-200">Code Template</h2>
          <CopyButton text={recipe.codeTemplate} />
        </div>
        <pre className="max-h-[500px] overflow-auto p-5 text-xs leading-relaxed text-gray-300">
          <code>{recipe.codeTemplate}</code>
        </pre>
      </div>

      {/* Props Schema */}
      {schemaRows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Props Schema</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Property</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Type</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Default</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schemaRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50/50">
                    <td className="px-5 py-2.5 font-mono text-xs font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-gray-600">{row.type}</td>
                    <td className="px-5 py-2.5 font-mono text-xs text-gray-500">{row.default}</td>
                    <td className="px-5 py-2.5 text-xs text-gray-500">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Raw JSON fallback for anything the table may not capture */}
          {schemaObj && (
            <details className="border-t border-gray-100">
              <summary className="cursor-pointer px-5 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-600">
                View raw JSON schema
              </summary>
              <pre className="overflow-auto bg-gray-50 px-5 pb-4 pt-2 text-xs text-gray-600">
                {JSON.stringify(schemaObj, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Fallback if no parseable schema rows but jsonSchema exists */}
      {schemaRows.length === 0 && schemaObj != null && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Props Schema</h2>
          </div>
          <pre className="overflow-auto p-5 text-xs text-gray-600">
            {JSON.stringify(schemaObj, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
