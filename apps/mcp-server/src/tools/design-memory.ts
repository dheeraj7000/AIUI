import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import {
  projects,
  styleTokens,
  designProfiles,
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
  meta: {
    project: string;
    slug: string;
    syncedAt: string;
    tokenCount: number;
    componentCount: 0;
    contentHash: string | null;
    stale: boolean;
    driftScore: number | null;
    driftChanges: DriftChange[];
    version: number;
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

  // Fetch project tokens
  const tokens = await db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenType: styleTokens.tokenType,
      tokenValue: styleTokens.tokenValue,
    })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, project.id))
    .orderBy(styleTokens.tokenType, styleTokens.tokenKey);

  // Fetch design profile (for staleness metadata + voice/tone + changelog)
  const [profile] = await db
    .select({
      compiledHash: designProfiles.compiledHash,
      tokensHash: designProfiles.tokensHash,
      compilationValid: designProfiles.compilationValid,
      version: designProfiles.version,
      updatedAt: designProfiles.updatedAt,
      compiledJson: designProfiles.compiledJson,
      voiceToneJson: designProfiles.voiceToneJson,
    })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, project.id))
    .limit(1);

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
  let driftScore: number | null;
  let driftChanges: DriftChange[];

  const currentTokensHash = await computeTokensHash(db, project.id);
  const contentHash: string | null = currentTokensHash;

  if (profile?.tokensHash && profile.tokensHash !== currentTokensHash) {
    stale = true;
  }

  if (profile && !profile.compilationValid) {
    stale = true;
  }

  // Drift detection: compare compiled profile tokens against live tokens
  const flatLive: Record<string, string> = {};
  for (const [type, typeTokens] of Object.entries(tokensByType)) {
    for (const [key, value] of Object.entries(typeTokens)) {
      flatLive[`${type}.${key}`] = value;
    }
  }

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
    driftScore = 50;
    driftChanges = [];
  } else {
    driftScore = 100;
    driftChanges = [];
  }

  const voiceTone = (profile?.voiceToneJson ?? null) as Record<string, unknown> | null;

  const syncedAt = new Date().toISOString();

  // ---------------------------------------------------------------------------
  // Generate markdown
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
  lines.push(`**Tokens:** ${tokens.length}  `);
  lines.push('');

  // =========================================================================
  // Intent — plainspoken answers from the Studio "Shape" discovery step.
  // These flow in from projects.studioDraft.shape so Claude has product
  // intent (audience, JTBD, emotional target, anti-refs) on every sync.
  // =========================================================================
  const shape = (project.studioDraft as { shape?: Record<string, unknown> } | null)?.shape;
  if (shape && typeof shape === 'object') {
    const audience = typeof shape.audience === 'string' ? shape.audience.trim() : '';
    const jobToBeDone = typeof shape.jobToBeDone === 'string' ? shape.jobToBeDone.trim() : '';
    const emotionAfterUse = Array.isArray(shape.emotionAfterUse)
      ? (shape.emotionAfterUse as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
    const brandPersonality = Array.isArray(shape.brandPersonality)
      ? (shape.brandPersonality as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
    const antiReferences = Array.isArray(shape.antiReferences)
      ? (shape.antiReferences as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];

    const hasAny =
      audience ||
      jobToBeDone ||
      emotionAfterUse.length > 0 ||
      brandPersonality.length > 0 ||
      antiReferences.length > 0;

    if (hasAny) {
      lines.push('## Intent');
      lines.push('');
      if (audience) lines.push(`**Audience:** ${audience}`);
      if (jobToBeDone) lines.push(`**Job to be done:** ${jobToBeDone}`);
      if (emotionAfterUse.length > 0)
        lines.push(`**Emotion after first use:** ${emotionAfterUse.join(', ')}`);
      if (brandPersonality.length > 0)
        lines.push(`**Brand personality:** ${brandPersonality.join(', ')}`);
      if (antiReferences.length > 0)
        lines.push(`**Anti-references (do NOT look like):** ${antiReferences.join(', ')}`);
      lines.push('');
    }
  }

  // Design rules
  lines.push('## Design Rules');
  lines.push('');
  lines.push(
    '1. **Use ONLY these tokens** for all design values — never hardcode colors, fonts, spacing, shadows, or any design values'
  );
  lines.push('2. **Call `validate_ui_output`** after generating UI to check design compliance');
  lines.push('3. **Match the framework target** — generate code for ' + project.frameworkTarget);
  lines.push(
    '4. **Follow accessibility guidelines** — use proper ARIA roles, keyboard navigation, and focus management'
  );
  lines.push('');

  // =========================================================================
  // Foundation Tokens
  // =========================================================================
  if (tokens.length > 0) {
    lines.push('## Foundation Tokens');
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
  lines.push(
    '| `get_theme_tokens(projectId, format)` | Export tokens as `tailwind` / `css` / `json` |'
  );
  lines.push(
    '| `validate_ui_output(projectId, code)` | Check generated code for design compliance |'
  );
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
    meta: {
      project: project.name,
      slug: project.slug,
      syncedAt,
      tokenCount: tokens.length,
      componentCount: 0,
      contentHash,
      stale,
      driftScore,
      driftChanges,
      version: currentVersion,
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
      const existingChangelog = (compiledJson?._changelog ?? []) as ChangelogEntry[];

      // Generate the new memory for comparison
      const newMemory = await generateDesignMemory(slug);

      // Components are gone after the scope cut — pass empty arrays to the differ.
      const diff = computeMemoryDiff(oldTokens, newMemory.tokensJson, [], []);

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
        syncMessage = `Synced design memory: ${diff.summary}${changedKeys.length > 0 ? ` (${changedKeys.join(', ')})` : ''}`;
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
          'See `.aiui/design-memory.md` for the active design system — design tokens and rules.\n' +
          '**Mandatory Workflow:**\n' +
          '1. Always call `validate_ui_output` after generating UI code to ensure token compliance.\n' +
          '2. If any issues are found, use `fix_compliance_issues` or manually correct the code before finishing.\n',
        diff: diff.hasChanges
          ? {
              summary: diff.summary,
              tokensAdded: diff.tokensAdded,
              tokensRemoved: diff.tokensRemoved,
              tokensModified: diff.tokensModified,
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

      // Compute current tokens hash from live DB (now project-scoped)
      const currentTokensHash = await computeTokensHash(db, project.id);

      // Fetch current tokens for count and drift detection
      const currentTokenRows = await db
        .select({
          tokenKey: styleTokens.tokenKey,
          tokenType: styleTokens.tokenType,
          tokenValue: styleTokens.tokenValue,
        })
        .from(styleTokens)
        .where(eq(styleTokens.projectId, project.id));

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
