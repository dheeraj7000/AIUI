import { notFound } from 'next/navigation';
import { createDb, componentRecipes, stylePacks } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { AddToProject } from './AddToProject';

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

  return recipe ?? null;
}

type RouteContext = { params: Promise<{ id: string }> };

export default async function ComponentDetailPage(props: RouteContext) {
  const { id } = await props.params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          <div className="mt-1 flex gap-2 text-sm">
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {recipe.type}
            </span>
            {recipe.packName && (
              <span className="text-xs text-gray-400">from {recipe.packName}</span>
            )}
          </div>
        </div>
        <AddToProject recipeId={recipe.id} />
      </div>

      {recipe.aiUsageRules && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">AI Usage Rules</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{recipe.aiUsageRules}</p>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Code Template</h2>
        <pre className="mt-3 max-h-[600px] overflow-auto rounded-md bg-gray-50 p-4 text-xs leading-relaxed text-gray-800">
          {recipe.codeTemplate}
        </pre>
      </div>

      {recipe.jsonSchema != null && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Props Schema</h2>
          <pre className="mt-3 overflow-auto rounded-md bg-gray-50 p-4 text-xs text-gray-800">
            {JSON.stringify(recipe.jsonSchema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
