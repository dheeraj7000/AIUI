import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq, count } from 'drizzle-orm';
import { StudioClient } from './StudioClient';

export const metadata = { title: 'Design Studio - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getData() {
  const db = getDb();

  const packs = await db.select().from(stylePacks).orderBy(stylePacks.name);

  const packsWithMeta = await Promise.all(
    packs.map(async (p) => {
      const [tc] = await db
        .select({ count: count() })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, p.id));
      const [rc] = await db
        .select({ count: count() })
        .from(componentRecipes)
        .where(eq(componentRecipes.stylePackId, p.id));
      return { ...p, tokenCount: tc?.count ?? 0, recipeCount: rc?.count ?? 0 };
    })
  );

  const recipes = await db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      slug: componentRecipes.slug,
      type: componentRecipes.type,
      stylePackId: componentRecipes.stylePackId,
      aiUsageRules: componentRecipes.aiUsageRules,
      packName: stylePacks.name,
    })
    .from(componentRecipes)
    .leftJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
    .orderBy(componentRecipes.type, componentRecipes.name);

  return { packs: packsWithMeta, recipes };
}

export default async function StudioPage() {
  const { packs, recipes } = await getData();
  return <StudioClient packs={packs} recipes={recipes} />;
}
