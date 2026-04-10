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
  computeTokensHash,
  detectDrift,
  computeMemoryDiff,
} from '@aiui/design-core';
import type { DriftChange } from '@aiui/design-core';
import { getContext } from '../lib/context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChangelogEntry {
  version: number;
  date: string;
  summary: string;
}

// ---------------------------------------------------------------------------
// Helper: update the _changelog array stored in compiledJson
// ---------------------------------------------------------------------------

async function updateCompiledJsonChangelog(
  db: ReturnType<typeof getDb>,
  projectId: string,
  changelog: ChangelogEntry[]
) {
  const [profile] = await db
    .select({ id: designProfiles.id, compiledJson: designProfiles.compiledJson })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, projectId))
    .limit(1);

  if (!profile) return;

  const existing = (profile.compiledJson ?? {}) as Record<string, unknown>;
  const updated = { ...existing, _changelog: changelog };

  await db
    .update(designProfiles)
    .set({ compiledJson: updated, updatedAt: new Date() })
    .where(eq(designProfiles.id, profile.id));
}

// ---------------------------------------------------------------------------
// Helper: compute memory age in hours from a Date
// ---------------------------------------------------------------------------

function computeMemoryAgeHours(updatedAt: Date): number {
  return (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
}

function getAgeWarning(ageHours: number): string | null {
  if (ageHours > 168) {
    const days = Math.floor(ageHours / 24);
    return `CRITICAL: Design memory is ${days} days old and likely outdated. Re-sync immediately.`;
  }
  if (ageHours > 24) {
    const hours = Math.floor(ageHours);
    return `WARNING: Design memory is ${hours} hours old. Strongly recommend re-syncing before building UI.`;
  }
  if (ageHours > 1) {
    const hours = Math.floor(ageHours);
    return `Design memory was synced ${hours} hours ago. Consider re-syncing if you've made changes.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Memory generator — builds the design memory content from DB state
// ---------------------------------------------------------------------------

interface DesignMemory {
  markdown: string;
  tokensJson: Record<string, Record<string, string>>;
  componentIndex: Array<{
    id: string;
    name: string;
    type: string;
    tier: string | null;
    usage: string | null;
  }>;
  meta: {
    project: string;
    slug: string;
    syncedAt: string;
    tokenCount: number;
    componentCount: number;
    contentHash: string | null;
    stale: boolean;
    driftScore: number | null;
    driftChanges: DriftChange[];
    version: number;
    tierCounts: { atom: number; molecule: number; organism: number; template: number };
    guidelineCoverage: number;
  };
}

// Token type display order and labels
const TOKEN_TYPE_LABELS: Record<string, string> = {
  color: 'Color',
  font: 'Font Family',
  'font-size': 'Font Size',
  'font-weight': 'Font Weight',
  'line-height': 'Line Height',
  'letter-spacing': 'Letter Spacing',
  spacing: 'Spacing',
  radius: 'Border Radius',
  shadow: 'Shadow',
  elevation: 'Elevation',
  'z-index': 'Z-Index',
  breakpoint: 'Breakpoint',
  opacity: 'Opacity',
  'border-width': 'Border Width',
  animation: 'Animation',
  transition: 'Transition',
};

const TOKEN_TYPE_ORDER = Object.keys(TOKEN_TYPE_LABELS);

// Component tier classification defaults
const ATOM_TYPES = new Set([
  'button',
  'input',
  'badge',
  'avatar',
  'tooltip',
  'toggle',
  'checkbox',
  'radio',
  'select',
  'textarea',
  'switch',
  'tag',
  'alert',
  'divider',
  'skeleton',
  'progress',
  'loader',
]);
const MOLECULE_TYPES = new Set([
  'card',
  'dropdown',
  'tabs',
  'modal',
  'dialog',
  'popover',
  'toast',
  'breadcrumb',
  'menu',
]);
const ORGANISM_TYPES = new Set([
  'hero',
  'pricing',
  'faq',
  'footer',
  'header',
  'cta',
  'testimonial',
  'feature',
  'contact',
  'navigation',
  'table',
  'sidebar',
  'toolbar',
  'stepper',
  'accordion',
]);
const TEMPLATE_TYPES = new Set(['layout', 'page-template']);

function inferTier(type: string, explicit?: string | null): string {
  if (explicit) return explicit;
  if (ATOM_TYPES.has(type)) return 'atom';
  if (MOLECULE_TYPES.has(type)) return 'molecule';
  if (ORGANISM_TYPES.has(type)) return 'organism';
  if (TEMPLATE_TYPES.has(type)) return 'template';
  return 'organism';
}

export async function generateDesignMemory(
  slug: string,
  changelog?: ChangelogEntry[]
): Promise<DesignMemory> {
  const db = getDb();

  // Fetch project
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) throw new NotFoundError('Project', slug);

  // Verify project org matches auth context
  const authCtx = getContext();
  if (authCtx?.organizationId && project.organizationId !== authCtx.organizationId) {
    throw new NotFoundError('Project', slug);
  }

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

  // Fetch selected components and staleness metadata
  const [profile] = await db
    .select({
      selectedComponents: designProfiles.selectedComponents,
      compiledHash: designProfiles.compiledHash,
      tokensHash: designProfiles.tokensHash,
      compilationValid: designProfiles.compilationValid,
      stylePackId: designProfiles.stylePackId,
      version: designProfiles.version,
      updatedAt: designProfiles.updatedAt,
      compiledJson: designProfiles.compiledJson,
    })
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

  // Staleness detection: compare current tokens hash against stored hash
  let stale = false;
  let contentHash: string | null = null;
  let driftScore: number | null = null;
  let driftChanges: DriftChange[] = [];

  const profileStylePackId = profile?.stylePackId ?? project.activeStylePackId;
  if (profileStylePackId) {
    const currentTokensHash = await computeTokensHash(db, profileStylePackId);
    contentHash = currentTokensHash;

    if (profile?.tokensHash && profile.tokensHash !== currentTokensHash) {
      stale = true;
    }

    if (!profile?.compilationValid) {
      stale = true;
    }

    // Drift detection: compare compiled profile tokens against live tokens
    // Flatten current live tokens into a flat map for drift comparison
    const flatLive: Record<string, string> = {};
    for (const [type, typeTokens] of Object.entries(tokensByType)) {
      for (const [key, value] of Object.entries(typeTokens)) {
        flatLive[`${type}.${key}`] = value;
      }
    }

    // Build flat map from compiled profile tokens if available
    const compiledJson = profile?.compiledJson as {
      tokens?: Record<string, Record<string, string>>;
    } | null;
    if (compiledJson?.tokens) {
      const flatCompiled: Record<string, string> = {};
      for (const [type, typeTokens] of Object.entries(compiledJson.tokens)) {
        for (const [key, value] of Object.entries(typeTokens)) {
          flatCompiled[`${type}.${key}`] = value;
        }
      }
      const driftResult = detectDrift(flatCompiled, flatLive);
      driftScore = driftResult.score;
      driftChanges = driftResult.changes;
    } else if (stale) {
      // No compiled tokens to compare but we know hashes differ
      driftScore = 50;
      driftChanges = [];
    } else {
      // No compiled profile yet, no drift to measure
      driftScore = 100;
      driftChanges = [];
    }
  }

  // Fetch voice/tone from design profile
  const [profileFull] = profile
    ? await db
        .select({ voiceToneJson: designProfiles.voiceToneJson })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1)
    : [null];
  const voiceTone = (profileFull?.voiceToneJson ?? null) as Record<string, unknown> | null;

  // Build component index with tier
  const componentIndex = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    tier: inferTier(r.type, (r as Record<string, unknown>).tier as string | null),
    usage: r.aiUsageRules,
  }));

  // Tier counts
  const tierCounts = { atom: 0, molecule: 0, organism: 0, template: 0 };
  for (const c of componentIndex) {
    if (c.tier in tierCounts) tierCounts[c.tier as keyof typeof tierCounts]++;
  }

  // Guideline coverage
  const withGuidelines = recipes.filter(
    (r) => (r as Record<string, unknown>).guidelinesJson
  ).length;
  const guidelineCoverage =
    recipes.length > 0 ? Math.round((withGuidelines / recipes.length) * 100) : 0;

  const syncedAt = new Date().toISOString();

  // ---------------------------------------------------------------------------
  // Generate markdown — Full 5-Layer Design System
  // ---------------------------------------------------------------------------
  const lines: string[] = [];

  lines.push(`# Design Memory — ${project.name}`);
  lines.push(
    `<!-- AIUI Design Memory | hash:${contentHash ?? 'none'} | synced:${syncedAt} | stale:${stale} -->`
  );
  lines.push(`<!-- Re-sync: call sync_design_memory with slug "${project.slug}" -->`);
  lines.push('');

  // Staleness warning
  if (stale) {
    lines.push(
      '> **Warning:** Design system was compiled with different tokens. Re-sync recommended.'
    );
    lines.push('');
  }

  // Low drift score warning
  if (driftScore !== null && driftScore < 80) {
    lines.push(
      `> **Drift Warning:** Design drift score is ${driftScore}/100. Tokens have diverged significantly from the compiled design system. Re-compile and re-sync immediately.`
    );
    lines.push('');
  }

  lines.push(`**Project:** ${project.name}  `);
  lines.push(`**Slug:** ${project.slug}  `);
  lines.push(`**Framework:** ${project.frameworkTarget}  `);
  lines.push(`**Style Pack:** ${pack ? pack.name : 'None'}  `);
  lines.push(
    `**Components:** ${recipes.length} (${tierCounts.atom} atoms, ${tierCounts.molecule} molecules, ${tierCounts.organism} organisms, ${tierCounts.template} templates)  `
  );
  lines.push(`**Tokens:** ${tokens.length}  `);
  lines.push('');

  // Design rules
  lines.push('## Design Rules');
  lines.push('');
  lines.push(
    '1. **Use ONLY these tokens** for all design values — never hardcode colors, fonts, spacing, shadows, or any design values'
  );
  lines.push('2. **Use ONLY the selected components** listed below as building blocks');
  lines.push(
    '3. **Call `get_component_recipe`** to get the full code template before using a component'
  );
  lines.push('4. **Call `validate_ui_output`** after generating UI to check design compliance');
  lines.push('5. **Match the framework target** — generate code for ' + project.frameworkTarget);
  lines.push(
    '6. **Follow accessibility guidelines** — use proper ARIA roles, keyboard navigation, and focus management'
  );
  lines.push('7. **Respect component variants** — use the defined variant values, not custom ones');
  lines.push('');

  // =========================================================================
  // LAYER 1: Foundation Tokens
  // =========================================================================
  if (tokens.length > 0) {
    lines.push('## Layer 1: Foundation Tokens');
    lines.push('');

    // Render tokens in defined order, skip empty types
    for (const type of TOKEN_TYPE_ORDER) {
      const typeTokens = tokensByType[type];
      if (!typeTokens || Object.keys(typeTokens).length === 0) continue;

      const label = TOKEN_TYPE_LABELS[type] ?? type;
      lines.push(`### ${label}`);
      lines.push('');
      lines.push('| Token | Value |');
      lines.push('|---|---|');
      for (const [key, value] of Object.entries(typeTokens)) {
        lines.push(`| \`${key}\` | \`${value}\` |`);
      }
      lines.push('');
    }

    // Render any types not in TOKEN_TYPE_ORDER (future-proof)
    for (const [type, typeTokens] of Object.entries(tokensByType)) {
      if (TOKEN_TYPE_ORDER.includes(type)) continue;
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

  // =========================================================================
  // LAYER 2-4: Component Library (grouped by tier)
  // =========================================================================
  if (recipes.length > 0) {
    lines.push('## Layer 2-4: Component Library');
    lines.push('');
    lines.push(
      'Call `get_component_recipe(recipeId)` to get the full code template for any component.'
    );
    lines.push('');

    const tierOrder = ['atom', 'molecule', 'organism', 'template'] as const;
    const tierLabels = {
      atom: 'Atomic Components',
      molecule: 'Molecular Components',
      organism: 'Organisms',
      template: 'Templates',
    };

    for (const tier of tierOrder) {
      const tierRecipes = recipes.filter(
        (r) => inferTier(r.type, (r as Record<string, unknown>).tier as string | null) === tier
      );
      if (tierRecipes.length === 0) continue;

      lines.push(`### ${tierLabels[tier]}`);
      lines.push('');

      for (const r of tierRecipes) {
        const rec = r as Record<string, unknown>;
        lines.push(`#### ${r.name}`);
        lines.push(`- **Type:** ${r.type}`);
        lines.push(`- **Tier:** ${tier}`);
        lines.push(`- **ID:** \`${r.id}\``);

        // Variants
        const variants = rec.variantsSchema as Record<
          string,
          { values: string[]; default: string }
        > | null;
        if (variants && Object.keys(variants).length > 0) {
          lines.push('- **Variants:**');
          for (const [dim, spec] of Object.entries(variants)) {
            lines.push(`  - \`${dim}\`: ${spec.values.join(', ')} (default: ${spec.default})`);
          }
        }

        // States
        const states = rec.statesSchema as { states?: string[] } | null;
        if (states?.states && states.states.length > 0) {
          lines.push(`- **States:** ${states.states.join(', ')}`);
        }

        // Composition
        const composed = rec.composedOf as Array<{
          role: string;
          componentType: string;
          required: boolean;
        }> | null;
        if (composed && composed.length > 0) {
          lines.push('- **Composed of:**');
          for (const ref of composed) {
            lines.push(
              `  - \`${ref.role}\`: ${ref.componentType}${ref.required ? ' (required)' : ''}`
            );
          }
        }

        // Usage rules
        if (r.aiUsageRules) {
          lines.push(`- **Usage:** ${r.aiUsageRules}`);
        }

        lines.push('');
      }
    }
  }

  // =========================================================================
  // LAYER 5: Guidelines & Documentation
  // =========================================================================
  const recipesWithGuidelines = recipes.filter(
    (r) => (r as Record<string, unknown>).guidelinesJson
  );
  if (recipesWithGuidelines.length > 0) {
    lines.push('## Layer 5: Component Guidelines');
    lines.push('');

    for (const r of recipesWithGuidelines) {
      const g = (r as Record<string, unknown>).guidelinesJson as Record<string, unknown>;
      if (!g) continue;

      lines.push(`### ${r.name} Guidelines`);
      lines.push('');

      const whenToUse = g.whenToUse as string[] | undefined;
      if (whenToUse?.length) {
        lines.push('**When to use:**');
        for (const item of whenToUse) lines.push(`- ${item}`);
        lines.push('');
      }

      const whenNotToUse = g.whenNotToUse as string[] | undefined;
      if (whenNotToUse?.length) {
        lines.push('**When NOT to use:**');
        for (const item of whenNotToUse) lines.push(`- ${item}`);
        lines.push('');
      }

      const doPatterns = g.doPatterns as string[] | undefined;
      if (doPatterns?.length) {
        lines.push('**Do:**');
        for (const item of doPatterns) lines.push(`- ${item}`);
        lines.push('');
      }

      const dontPatterns = g.dontPatterns as string[] | undefined;
      if (dontPatterns?.length) {
        lines.push("**Don't:**");
        for (const item of dontPatterns) lines.push(`- ${item}`);
        lines.push('');
      }

      const a11y = g.accessibility as Record<string, unknown> | undefined;
      if (a11y) {
        lines.push('**Accessibility:**');
        if (a11y.ariaRoles) lines.push(`- ARIA roles: ${(a11y.ariaRoles as string[]).join(', ')}`);
        if (a11y.keyboardNav)
          lines.push(`- Keyboard: ${(a11y.keyboardNav as string[]).join('; ')}`);
        if (a11y.focusManagement) lines.push(`- Focus: ${a11y.focusManagement}`);
        if (a11y.screenReader) lines.push(`- Screen reader: ${a11y.screenReader}`);
        if (a11y.contrastNotes) lines.push(`- Contrast: ${a11y.contrastNotes}`);
        lines.push('');
      }

      const content = g.contentGuidelines as Record<string, unknown> | undefined;
      if (content) {
        lines.push('**Content:**');
        if (content.tone) lines.push(`- Tone: ${content.tone}`);
        if (content.capitalization) lines.push(`- Capitalization: ${content.capitalization}`);
        if (content.maxLength) lines.push(`- Max length: ${content.maxLength} characters`);
        lines.push('');
      }
    }
  }

  // Accessibility Standards (global)
  lines.push('## Accessibility Standards');
  lines.push('');
  lines.push('All generated UI must follow these accessibility requirements:');
  lines.push('');
  lines.push('- **Color contrast:** WCAG AA minimum 4.5:1 for normal text, 3:1 for large text');
  lines.push('- **Focus indicators:** All interactive elements must have visible focus rings');
  lines.push(
    '- **Keyboard navigation:** All functionality available via keyboard (Tab, Enter, Space, Escape, Arrow keys)'
  );
  lines.push(
    '- **ARIA labels:** Interactive elements without visible text must have aria-label or aria-labelledby'
  );
  lines.push(
    '- **Semantic HTML:** Use native HTML elements (button, input, nav, etc.) before ARIA roles'
  );
  lines.push('- **Form labels:** Every input must have an associated label element');
  lines.push('- **Image alt text:** All img elements must have meaningful alt attributes');
  lines.push('- **Heading hierarchy:** Use h1-h6 in order without skipping levels');
  lines.push('- **Motion safety:** Respect prefers-reduced-motion media query for animations');
  lines.push('- **Touch targets:** Interactive elements must be at least 44x44px');
  lines.push('');

  // Voice & Tone
  if (voiceTone) {
    lines.push('## Voice & Tone');
    lines.push('');

    const attrs = voiceTone.voiceAttributes as string[] | undefined;
    if (attrs?.length) {
      lines.push(`**Voice:** ${attrs.join(', ')}`);
      lines.push('');
    }

    const toneGuidelines = voiceTone.toneGuidelines as Record<string, string> | undefined;
    if (toneGuidelines && Object.keys(toneGuidelines).length > 0) {
      lines.push('**Tone by context:**');
      for (const [context, tone] of Object.entries(toneGuidelines)) {
        lines.push(`- **${context}:** ${tone}`);
      }
      lines.push('');
    }

    const rules = voiceTone.writingRules as string[] | undefined;
    if (rules?.length) {
      lines.push('**Writing rules:**');
      for (const rule of rules) lines.push(`- ${rule}`);
      lines.push('');
    }

    const terminology = voiceTone.terminology as
      | { preferred?: Record<string, string>; avoided?: string[] }
      | undefined;
    if (terminology) {
      if (terminology.preferred && Object.keys(terminology.preferred).length > 0) {
        lines.push('**Preferred terms:**');
        for (const [term, note] of Object.entries(terminology.preferred)) {
          lines.push(`- Use "${term}" (${note})`);
        }
        lines.push('');
      }
      if (terminology.avoided?.length) {
        lines.push(`**Avoid:** ${terminology.avoided.join(', ')}`);
        lines.push('');
      }
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
  lines.push('| `check_design_memory(slug)` | Check if design memory is fresh or stale |');
  lines.push('');

  // Change History
  if (changelog && changelog.length > 0) {
    lines.push('## Change History');
    lines.push('<!-- Auto-generated by AIUI -->');
    for (const entry of changelog) {
      lines.push(`- **v${entry.version}** (${entry.date}): ${entry.summary}`);
    }
    lines.push('');
  }

  const currentVersion = profile?.version ?? 1;

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
      contentHash,
      stale,
      driftScore,
      driftChanges,
      version: currentVersion,
      tierCounts,
      guidelineCoverage,
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
      'Supports incremental mode that computes a diff and returns early if nothing changed. ' +
      'Add "See .aiui/design-memory.md for the active design system" to your CLAUDE.md ' +
      'so Claude loads it automatically in every conversation.',
    {
      slug: z.string().describe('The project slug'),
      targetDir: z
        .string()
        .describe('Absolute path to the project root directory where .aiui/ will be created'),
      mode: z
        .enum(['full', 'incremental'])
        .optional()
        .default('full')
        .describe('Sync mode: "full" always regenerates, "incremental" skips if no changes'),
    },
    async (args) => {
      const slug = args.slug as string;
      const targetDir = args.targetDir as string;
      const mode = (args.mode as string) ?? 'full';

      const db = getDb();

      // Fetch project and design profile for diff and changelog
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      if (!project) throw new NotFoundError('Project', slug);

      // Verify project org matches auth context
      const authCtxSync = getContext();
      if (authCtxSync?.organizationId && project.organizationId !== authCtxSync.organizationId) {
        throw new NotFoundError('Project', slug);
      }

      const [profile] = await db
        .select()
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1);

      // Extract previous state from compiledJson for diffing
      const compiledJson = profile?.compiledJson as Record<string, unknown> | null;
      const oldTokens = (compiledJson?.tokens ?? {}) as Record<string, Record<string, string>>;
      const oldComponents = (compiledJson?.components ?? []) as Array<{
        id: string;
        name: string;
        type: string;
      }>;
      const existingChangelog = (compiledJson?._changelog ?? []) as ChangelogEntry[];

      // Generate the new memory for comparison
      const newMemory = await generateDesignMemory(slug);
      const newComponents = newMemory.componentIndex.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      }));

      const diff = computeMemoryDiff(oldTokens, newMemory.tokensJson, oldComponents, newComponents);

      // In incremental mode, return early if nothing changed
      if (mode === 'incremental' && !diff.hasChanges) {
        return {
          status: 'up_to_date',
          message: 'Design memory is already up to date. No changes needed.',
          meta: newMemory.meta,
        };
      }

      // Build changelog entry
      const newVersion = (profile?.version ?? 0) + 1;
      const today = new Date().toISOString().split('T')[0];
      const changelogSummary = diff.hasChanges
        ? diff.summary
        : existingChangelog.length === 0
          ? 'Initial sync'
          : 'Full re-sync (no token changes)';

      const newEntry: ChangelogEntry = {
        version: newVersion,
        date: today,
        summary: changelogSummary,
      };
      const updatedChangelog = [...existingChangelog, newEntry];

      // Regenerate memory with changelog
      const memory = await generateDesignMemory(slug, updatedChangelog);

      // Persist changelog in compiledJson
      await updateCompiledJsonChangelog(db, project.id, updatedChangelog);

      // Build human-readable sync message
      let syncMessage: string;
      if (diff.hasChanges) {
        const changedKeys = [
          ...diff.tokensModified.map((t) => t.key),
          ...diff.tokensAdded.map((t) => t.key),
          ...diff.tokensRemoved.map((t) => t.key),
        ];
        const changedComponentNames = [
          ...diff.componentsAdded.map((c) => c.name),
          ...diff.componentsRemoved.map((c) => c.name),
        ];
        const detailParts: string[] = [];
        if (changedKeys.length > 0) detailParts.push(changedKeys.join(', '));
        if (changedComponentNames.length > 0) detailParts.push(changedComponentNames.join(', '));
        syncMessage = `Synced design memory: ${diff.summary}${detailParts.length > 0 ? ` (${detailParts.join('; ')})` : ''}`;
      } else {
        syncMessage = 'Synced design memory: full regeneration complete';
      }

      return {
        status: 'synced',
        message: syncMessage,
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
        diff: diff.hasChanges
          ? {
              summary: diff.summary,
              tokensAdded: diff.tokensAdded,
              tokensRemoved: diff.tokensRemoved,
              tokensModified: diff.tokensModified,
              componentsAdded: diff.componentsAdded,
              componentsRemoved: diff.componentsRemoved,
            }
          : null,
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
      'Useful for previewing the design context or loading it into the conversation. ' +
      'Includes age-based warnings if the memory is potentially stale.',
    {
      slug: z.string().describe('The project slug'),
    },
    async (args) => {
      const slug = args.slug as string;
      const db = getDb();

      // Fetch the design profile to check age
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      if (!project) throw new NotFoundError('Project', slug);

      // Verify project org matches auth context
      const authCtxGet = getContext();
      if (authCtxGet?.organizationId && project.organizationId !== authCtxGet.organizationId) {
        throw new NotFoundError('Project', slug);
      }

      const [profile] = await db
        .select({ updatedAt: designProfiles.updatedAt })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1);

      const memory = await generateDesignMemory(slug);

      // Compute age-based warning
      let memoryAge: number | null = null;
      let ageWarning: string | null = null;
      if (profile?.updatedAt) {
        memoryAge = computeMemoryAgeHours(profile.updatedAt);
        ageWarning = getAgeWarning(memoryAge);
      }

      return {
        ...memory,
        meta: {
          ...memory.meta,
          memoryAge: memoryAge !== null ? Math.round(memoryAge * 10) / 10 : null,
          ageWarning,
        },
      };
    }
  );

  // -------------------------------------------------------------------------
  // check_design_memory — freshness check without regeneration
  // -------------------------------------------------------------------------

  server.registerTool(
    'check_design_memory',
    'Check if the design memory for a project is up to date. Returns freshness status without regenerating.',
    {
      slug: z.string().describe('Project slug'),
    },
    async (args) => {
      const slug = args.slug as string;
      const db = getDb();

      // Fetch project
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      if (!project) throw new NotFoundError('Project', slug);

      // Verify project org matches auth context
      const authCtxCheck = getContext();
      if (authCtxCheck?.organizationId && project.organizationId !== authCtxCheck.organizationId) {
        throw new NotFoundError('Project', slug);
      }

      // Fetch design profile
      const [profile] = await db
        .select({
          compiledHash: designProfiles.compiledHash,
          tokensHash: designProfiles.tokensHash,
          compilationValid: designProfiles.compilationValid,
          stylePackId: designProfiles.stylePackId,
          updatedAt: designProfiles.updatedAt,
          compiledJson: designProfiles.compiledJson,
        })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1);

      if (!profile) {
        return {
          fresh: false,
          lastSyncedAt: null,
          currentTokenCount: 0,
          driftScore: 0,
          changes: { added: [], removed: [], modified: [] },
          recommendation:
            'No design system found for this project. Call sync_design_memory to create one.',
        };
      }

      // Compute current tokens hash from live DB
      const stylePackId = profile.stylePackId ?? project.activeStylePackId;
      if (!stylePackId) {
        return {
          fresh: true,
          lastSyncedAt: profile.updatedAt.toISOString(),
          currentTokenCount: 0,
          driftScore: 100,
          changes: { added: [], removed: [], modified: [] },
          recommendation: 'No style pack assigned. Memory is trivially fresh.',
        };
      }

      const currentTokensHash = await computeTokensHash(db, stylePackId);

      // Fetch current tokens for count and drift detection
      const currentTokenRows = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenType: styleTokens.tokenType,
          tokenValue: styleTokens.tokenValue,
        })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, stylePackId));

      const currentTokenCount = currentTokenRows.length;

      // Determine freshness
      let fresh = true;
      if (profile.tokensHash && profile.tokensHash !== currentTokensHash) {
        fresh = false;
      }
      if (!profile.compilationValid) {
        fresh = false;
      }

      // Compute drift
      let driftScore = 100;
      const changes: { added: string[]; removed: string[]; modified: string[] } = {
        added: [],
        removed: [],
        modified: [],
      };

      // Build flat map of current live tokens
      const flatLive: Record<string, string> = {};
      for (const t of currentTokenRows) {
        flatLive[`${t.tokenType}.${t.tokenKey}`] = t.tokenValue;
      }

      // Build flat map from compiled profile tokens
      const compiledJson = profile.compiledJson as {
        tokens?: Record<string, Record<string, string>>;
      } | null;
      if (compiledJson?.tokens) {
        const flatCompiled: Record<string, string> = {};
        for (const [type, typeTokens] of Object.entries(compiledJson.tokens)) {
          for (const [key, value] of Object.entries(typeTokens)) {
            flatCompiled[`${type}.${key}`] = value;
          }
        }

        const driftResult = detectDrift(flatCompiled, flatLive);
        driftScore = driftResult.score;

        for (const change of driftResult.changes) {
          if (change.type === 'added') changes.added.push(change.tokenKey);
          else if (change.type === 'removed') changes.removed.push(change.tokenKey);
          else if (change.type === 'changed') changes.modified.push(change.tokenKey);
        }
      }

      // Build recommendation
      const totalChanges = changes.added.length + changes.removed.length + changes.modified.length;
      let recommendation: string;
      if (fresh && totalChanges === 0) {
        recommendation = 'Memory is fresh.';
      } else {
        const parts: string[] = [];
        if (changes.added.length > 0) parts.push(`${changes.added.length} added`);
        if (changes.removed.length > 0) parts.push(`${changes.removed.length} removed`);
        if (changes.modified.length > 0) parts.push(`${changes.modified.length} modified`);
        recommendation = `Re-sync recommended: ${totalChanges} token${totalChanges !== 1 ? 's' : ''} changed (${parts.join(', ')}).`;
      }

      return {
        fresh,
        lastSyncedAt: profile.updatedAt.toISOString(),
        currentTokenCount,
        driftScore,
        changes,
        recommendation,
      };
    }
  );
}
