import { NextRequest, NextResponse } from 'next/server';
import { createDb, stylePacks, styleTokens, componentRecipes } from '@aiui/design-core';
import { eq, count } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const db = getDb();

    // Fetch style pack by slug
    const [pack] = await db.select().from(stylePacks).where(eq(stylePacks.slug, slug)).limit(1);

    if (!pack) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
    }

    // Fetch tokens
    const tokens = await db
      .select({
        key: styleTokens.tokenKey,
        type: styleTokens.tokenType,
        value: styleTokens.tokenValue,
        description: styleTokens.description,
      })
      .from(styleTokens)
      .where(eq(styleTokens.stylePackId, pack.id));

    // Fetch component counts
    const [recipeCount] = await db
      .select({ count: count() })
      .from(componentRecipes)
      .where(eq(componentRecipes.stylePackId, pack.id));

    return NextResponse.json({
      name: pack.name,
      slug: pack.slug,
      version: pack.version || '1.0.0',
      category: pack.category,
      description: pack.description,
      tokenCount: tokens.length,
      componentCount: recipeCount?.count ?? 0,
      tokens: tokens,
      componentSlugs: [], // Placeholder for now
    });
  } catch (error) {
    console.error('Registry Pack Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
