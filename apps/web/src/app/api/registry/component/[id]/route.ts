import { NextRequest, NextResponse } from 'next/server';
import { createDb, componentRecipes } from '@aiui/design-core';
import { eq } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: slug } = await context.params; // Using 'id' parameter as slug for the CLI
    const db = getDb();

    // Fetch component by slug
    const [recipe] = await db
      .select()
      .from(componentRecipes)
      .where(eq(componentRecipes.slug, slug))
      .limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: recipe.id,
      name: recipe.name,
      slug: recipe.slug,
      type: recipe.type,
      description: recipe.name, // Use name if description is missing
      codeTemplate: recipe.codeTemplate,
      propsSchema: recipe.jsonSchema,
      aiUsageRules: recipe.aiUsageRules,
      stylePackId: recipe.stylePackId,
      dependencies: [], // Placeholder
    });
  } catch (error) {
    console.error('Registry Component Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
