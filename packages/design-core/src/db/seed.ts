/**
 * Seed script — populates the design registry with default style packs,
 * tokens, and component recipes.
 *
 * Idempotent: checks for existing packs by slug before inserting.
 *
 * Usage: pnpm --filter @aiui/design-core seed
 */

import { eq } from 'drizzle-orm';
import { createDb } from './index';
import { stylePacks, styleTokens, componentRecipes } from './schema';
import { saasCleanV1 } from './seed-data/saas-clean-v1';
import { fintechLightV1 } from './seed-data/fintech-light-v1';
import { startupBoldV1 } from './seed-data/startup-bold-v1';
import { shadcnEssentials } from './seed-data/shadcn-essentials';
import { magicuiEffects } from './seed-data/magicui-effects';
import { communityCreative } from './seed-data/community-creative';

const SEED_PACKS = [
  saasCleanV1,
  fintechLightV1,
  startupBoldV1,
  shadcnEssentials,
  magicuiEffects,
  communityCreative,
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const db = createDb(connectionString);
  console.log('Starting seed...\n');

  for (const packData of SEED_PACKS) {
    // Check if pack already exists
    const [existing] = await db
      .select({ id: stylePacks.id })
      .from(stylePacks)
      .where(eq(stylePacks.slug, packData.pack.slug))
      .limit(1);

    if (existing) {
      console.log(`  ⏭  ${packData.pack.name} (${packData.pack.slug}) already exists, skipping`);
      continue;
    }

    // Insert in a transaction
    await db.transaction(async (tx) => {
      // Create style pack
      const [pack] = await tx
        .insert(stylePacks)
        .values({
          name: packData.pack.name,
          slug: packData.pack.slug,
          category: packData.pack.category,
          description: packData.pack.description,
          version: packData.pack.version,
          isPublic: packData.pack.isPublic,
        })
        .returning();

      // Insert tokens
      if (packData.tokens.length > 0) {
        await tx.insert(styleTokens).values(
          packData.tokens.map((t) => ({
            stylePackId: pack.id,
            tokenKey: t.tokenKey,
            tokenType: t.tokenType,
            tokenValue: t.tokenValue,
          }))
        );
      }

      // Insert recipes
      if (packData.recipes.length > 0) {
        await tx.insert(componentRecipes).values(
          packData.recipes.map((r) => ({
            name: r.name,
            slug: r.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
            type: r.type,
            stylePackId: pack.id,
            codeTemplate: r.codeTemplate,
            jsonSchema: r.jsonSchema,
            aiUsageRules: r.aiUsageRules,
          }))
        );
      }

      console.log(
        `  ✓  ${packData.pack.name} (${packData.tokens.length} tokens, ${packData.recipes.length} recipes)`
      );
    });
  }

  console.log('\nSeed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
