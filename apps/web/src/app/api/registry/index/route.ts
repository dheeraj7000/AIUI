import { NextResponse } from 'next/server';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq, isNull, count } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

export async function GET() {
  try {
    const db = getDb();

    // Public registry index lists only seeded/system packs (organization_id IS NULL).
    const packs = await db.select().from(stylePacks).where(isNull(stylePacks.organizationId));

    const items = await Promise.all(
      packs.map(async (pack) => {
        const [tokens] = await db
          .select({ count: count() })
          .from(styleTokens)
          .where(eq(styleTokens.stylePackId, pack.id));
        const [recipes] = await db
          .select({ count: count() })
          .from(componentRecipes)
          .where(eq(componentRecipes.stylePackId, pack.id));

        return {
          name: pack.name,
          slug: pack.slug,
          version: pack.version || '1.0.0',
          category: pack.category,
          description: pack.description ?? '',
          tokenCount: tokens?.count ?? 0,
          componentCount: recipes?.count ?? 0,
        };
      })
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error('Registry Index Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
