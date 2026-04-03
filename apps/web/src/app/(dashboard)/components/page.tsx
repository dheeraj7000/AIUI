import { createDb, componentRecipes, stylePacks, styleTokens } from '@aiui/design-core';
import { eq, inArray } from 'drizzle-orm';
import { ComponentGrid, type RecipeItem } from './ComponentGrid';

export const metadata = { title: 'Components - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getRecipesWithColors(): Promise<RecipeItem[]> {
  const db = getDb();

  // Fetch all recipes joined with packs
  const recipes = await db
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
      packCategory: stylePacks.category,
    })
    .from(componentRecipes)
    .leftJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
    .orderBy(componentRecipes.name);

  // Collect unique non-null pack IDs to fetch their color tokens
  const packIds = [
    ...new Set(recipes.map((r) => r.stylePackId).filter((id): id is string => id != null)),
  ];

  // Fetch color tokens for all relevant packs in one query
  const colorTokens =
    packIds.length > 0
      ? await db
          .select({
            stylePackId: styleTokens.stylePackId,
            tokenKey: styleTokens.tokenKey,
            tokenValue: styleTokens.tokenValue,
          })
          .from(styleTokens)
          .where(inArray(styleTokens.stylePackId, packIds))
      : [];

  // Build a pack-id -> colors map
  const packColorMap: Record<
    string,
    { primary?: string; bg?: string; text?: string; accent?: string }
  > = {};

  for (const token of colorTokens) {
    if (!packColorMap[token.stylePackId]) {
      packColorMap[token.stylePackId] = {};
    }
    const colors = packColorMap[token.stylePackId];
    if (token.tokenKey === 'color.primary') colors.primary = token.tokenValue;
    if (token.tokenKey === 'color.background') colors.bg = token.tokenValue;
    if (token.tokenKey === 'color.text-primary') colors.text = token.tokenValue;
    if (token.tokenKey === 'color.accent') colors.accent = token.tokenValue;
  }

  return recipes.map((r) => ({
    ...r,
    stylePackId: r.stylePackId ?? '',
    colors: r.stylePackId ? packColorMap[r.stylePackId] : undefined,
    primaryColor: r.stylePackId ? packColorMap[r.stylePackId]?.primary : undefined,
  }));
}

export default async function ComponentBrowserPage() {
  const recipes = await getRecipesWithColors();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Components</h1>
      <p className="mt-2 text-sm text-gray-600">
        Browse {recipes.length} component recipes from your design library.
      </p>

      <ComponentGrid recipes={recipes} />
    </div>
  );
}
