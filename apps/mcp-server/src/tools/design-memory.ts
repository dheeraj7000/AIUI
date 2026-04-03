import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import {
  projects,
  stylePacks,
  styleTokens,
  designProfiles,
  componentRecipes,
  assets,
} from '@aiui/design-core';

// ---------------------------------------------------------------------------
// Memory generator — builds the design memory content from DB state
// ---------------------------------------------------------------------------

interface DesignMemory {
  markdown: string;
  tokensJson: Record<string, Record<string, string>>;
  componentIndex: Array<{ id: string; name: string; type: string; usage: string | null }>;
  meta: {
    project: string;
    slug: string;
    syncedAt: string;
    tokenCount: number;
    componentCount: number;
  };
}

async function generateDesignMemory(slug: string): Promise<DesignMemory> {
  const db = getDb();

  // Fetch project
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) throw new NotFoundError('Project', slug);

  // Fetch style pack + tokens
  let pack: typeof stylePacks.$inferSelect | null = null;
  let tokens: Array<{ tokenKey: string; tokenType: string; tokenValue: string }> = [];
  if (project.activeStylePackId) {
    const [p] = await db
      .select()
      .from(stylePacks)
      .where(eq(stylePacks.id, project.activeStylePackId))
      .limit(1);
    pack = p ?? null;
    if (pack) {
      tokens = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenType: styleTokens.tokenType,
          tokenValue: styleTokens.tokenValue,
        })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, pack.id))
        .orderBy(styleTokens.tokenType, styleTokens.tokenKey);
    }
  }

  // Fetch selected components
  const [profile] = await db
    .select({ selectedComponents: designProfiles.selectedComponents })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, project.id))
    .limit(1);
  let recipes: Array<typeof componentRecipes.$inferSelect> = [];
  if (profile) {
    const ids = profile.selectedComponents as string[];
    if (ids?.length > 0) {
      recipes = await db.select().from(componentRecipes).where(inArray(componentRecipes.id, ids));
    }
  }

  // Fetch assets
  const projectAssets = await db
    .select({ name: assets.name, type: assets.type, publicUrl: assets.publicUrl })
    .from(assets)
    .where(eq(assets.projectId, project.id));

  // Group tokens by type
  const tokensByType: Record<string, Record<string, string>> = {};
  for (const t of tokens) {
    if (!tokensByType[t.tokenType]) tokensByType[t.tokenType] = {};
    tokensByType[t.tokenType][t.tokenKey] = t.tokenValue;
  }

  // Build component index
  const componentIndex = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    usage: r.aiUsageRules,
  }));

  const syncedAt = new Date().toISOString();

  // ---------------------------------------------------------------------------
  // Generate markdown
  // ---------------------------------------------------------------------------
  const lines: string[] = [];

  lines.push(`# Design Memory — ${project.name}`);
  lines.push(`<!-- Auto-synced from AIUI on ${syncedAt} -->`);
  lines.push(`<!-- Re-sync: call sync_design_memory with slug "${project.slug}" -->`);
  lines.push('');
  lines.push(`**Project:** ${project.name}  `);
  lines.push(`**Slug:** ${project.slug}  `);
  lines.push(`**Framework:** ${project.frameworkTarget}  `);
  lines.push(`**Style Pack:** ${pack ? pack.name : 'None'}  `);
  lines.push(`**Components:** ${recipes.length}  `);
  lines.push(`**Tokens:** ${tokens.length}  `);
  lines.push('');

  // Design rules
  lines.push('## Design Rules');
  lines.push('');
  lines.push(
    '1. **Use ONLY these tokens** for all design values — never hardcode colors, fonts, spacing, or shadows'
  );
  lines.push('2. **Use ONLY the selected components** listed below as building blocks');
  lines.push(
    '3. **Call `get_component_recipe`** to get the full code template before using a component'
  );
  lines.push('4. **Call `validate_ui_output`** after generating UI to check design compliance');
  lines.push('5. **Match the framework target** — generate code for ' + project.frameworkTarget);
  lines.push('');

  // Tokens
  if (tokens.length > 0) {
    lines.push('## Design Tokens');
    lines.push('');

    for (const [type, typeTokens] of Object.entries(tokensByType)) {
      lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}`);
      lines.push('');
      lines.push('| Token | Value |');
      lines.push('|---|---|');
      for (const [key, value] of Object.entries(typeTokens)) {
        lines.push(`| \`${key}\` | \`${value}\` |`);
      }
      lines.push('');
    }
  }

  // Components
  if (recipes.length > 0) {
    lines.push('## Selected Components');
    lines.push('');
    lines.push(
      'Call `get_component_recipe(recipeId)` to get the full code template for any component.'
    );
    lines.push('');

    for (const r of recipes) {
      lines.push(`### ${r.name}`);
      lines.push(`- **Type:** ${r.type}`);
      lines.push(`- **ID:** \`${r.id}\``);
      if (r.aiUsageRules) {
        lines.push(`- **Usage:** ${r.aiUsageRules}`);
      }
      lines.push('');
    }
  }

  // Assets
  if (projectAssets.length > 0) {
    lines.push('## Assets');
    lines.push('');
    lines.push('| Name | Type | URL |');
    lines.push('|---|---|---|');
    for (const a of projectAssets) {
      lines.push(`| ${a.name} | ${a.type} | ${a.publicUrl ?? '(no URL)'} |`);
    }
    lines.push('');
  }

  // MCP tools reference
  lines.push('## MCP Tools Quick Reference');
  lines.push('');
  lines.push('| Tool | Use for |');
  lines.push('|---|---|');
  lines.push('| `get_component_recipe(recipeId)` | Get full code template + props schema |');
  lines.push(
    '| `get_theme_tokens(projectId, format)` | Export tokens as `tailwind` / `css` / `json` |'
  );
  lines.push(
    '| `validate_ui_output(projectId, code)` | Check generated code for design compliance |'
  );
  lines.push('| `list_components(stylePackId?)` | Browse all available component recipes |');
  lines.push('| `get_asset_manifest(projectId)` | Get project assets with CDN URLs |');
  lines.push('| `sync_design_memory(slug, targetDir)` | Re-sync this file after design changes |');
  lines.push('');

  return {
    markdown: lines.join('\n'),
    tokensJson: tokensByType,
    componentIndex,
    meta: {
      project: project.name,
      slug: project.slug,
      syncedAt,
      tokenCount: tokens.length,
      componentCount: recipes.length,
    },
  };
}

// ---------------------------------------------------------------------------
// MCP tool registration
// ---------------------------------------------------------------------------

export function registerDesignMemory(server: AiuiMcpServer) {
  server.registerTool(
    'sync_design_memory',
    'Generate or update the persistent design memory files for a project. ' +
      'Creates .aiui/design-memory.md (full design context for Claude) and ' +
      '.aiui/tokens.json (machine-readable tokens). ' +
      'Add "See .aiui/design-memory.md for the active design system" to your CLAUDE.md ' +
      'so Claude loads it automatically in every conversation.',
    {
      slug: z.string().describe('The project slug'),
      targetDir: z
        .string()
        .describe('Absolute path to the project root directory where .aiui/ will be created'),
    },
    async (args) => {
      const slug = args.slug as string;
      const targetDir = args.targetDir as string;

      const memory = await generateDesignMemory(slug);

      // Return the files to write — Claude will write them using its own file tools
      return {
        files: [
          {
            path: `${targetDir}/.aiui/design-memory.md`,
            content: memory.markdown,
          },
          {
            path: `${targetDir}/.aiui/tokens.json`,
            content: JSON.stringify(memory.tokensJson, null, 2),
          },
        ],
        claudeMdSnippet:
          '# Design System\n' +
          'This project uses AIUI for design management.\n' +
          'See `.aiui/design-memory.md` for the active design system — tokens, components, and rules.\n' +
          'Always follow the design rules defined there before building any UI.\n',
        meta: memory.meta,
        instructions:
          'Write each file in the "files" array to the specified path. ' +
          'Then add the "claudeMdSnippet" content to the project\'s CLAUDE.md file. ' +
          'This ensures the design memory is loaded automatically in every conversation.',
      };
    }
  );

  server.registerTool(
    'get_design_memory',
    'Get the current design memory content for a project without writing files. ' +
      'Useful for previewing the design context or loading it into the conversation.',
    {
      slug: z.string().describe('The project slug'),
    },
    async (args) => {
      const memory = await generateDesignMemory(args.slug as string);
      return memory;
    }
  );
}
