import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  createDb,
  projects,
  stylePacks,
  styleTokens,
  componentRecipes,
  designProfiles,
  assets,
} from '@aiui/design-core';
import { eq, count, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getProject(slug: string) {
  const db = getDb();

  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

  if (!project) return null;

  // Style pack
  let pack = null;
  let tokens: { tokenKey: string; tokenType: string; tokenValue: string }[] = [];
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

  // Selected components from design profile
  const [profile] = await db
    .select({ selectedComponents: designProfiles.selectedComponents })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, project.id))
    .limit(1);

  let selectedRecipes: { id: string; name: string; type: string; slug: string }[] = [];
  if (profile) {
    const ids = profile.selectedComponents as string[];
    if (ids && ids.length > 0) {
      selectedRecipes = await db
        .select({
          id: componentRecipes.id,
          name: componentRecipes.name,
          type: componentRecipes.type,
          slug: componentRecipes.slug,
        })
        .from(componentRecipes)
        .where(inArray(componentRecipes.id, ids));
    }
  }

  // Asset count
  const [assetCount] = await db
    .select({ count: count() })
    .from(assets)
    .where(eq(assets.projectId, project.id));

  return {
    ...project,
    pack,
    tokens,
    selectedRecipes,
    assetCount: assetCount?.count ?? 0,
  };
}

const tokenTypeColors: Record<string, string> = {
  color: 'bg-pink-50 text-pink-700',
  radius: 'bg-blue-50 text-blue-700',
  font: 'bg-amber-50 text-amber-700',
  spacing: 'bg-green-50 text-green-700',
  shadow: 'bg-purple-50 text-purple-700',
  elevation: 'bg-indigo-50 text-indigo-700',
};

type RouteContext = { params: Promise<{ slug: string }> };

export default async function ProjectDetailPage(props: RouteContext) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  const tokensByType = project.tokens.reduce<Record<string, typeof project.tokens>>((acc, t) => {
    (acc[t.tokenType] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          )}
          <div className="mt-2 flex gap-2 text-xs text-gray-400">
            <span>/{project.slug}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
              {project.frameworkTarget}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{project.tokens.length}</div>
          <div className="text-sm text-gray-500">Tokens</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{project.selectedRecipes.length}</div>
          <div className="text-sm text-gray-500">Components</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{project.assetCount}</div>
          <div className="text-sm text-gray-500">Assets</div>
        </div>
      </div>

      {/* Style Pack */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Style Pack</h2>
        {project.pack ? (
          <div className="mt-3 space-y-4">
            <Link
              href={`/style-packs/${project.pack.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{project.pack.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {project.pack.category} · v{project.pack.version}
                  </span>
                </div>
                <span className="text-xs text-blue-600">View pack</span>
              </div>
              {project.pack.description && (
                <p className="mt-1 text-sm text-gray-500">{project.pack.description}</p>
              )}
            </Link>

            {/* Token preview */}
            {Object.entries(tokensByType).map(([type, typeTokens]) => (
              <div key={type} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${tokenTypeColors[type] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {type}
                  </span>
                  <span className="text-xs text-gray-400">{typeTokens.length}</span>
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {typeTokens.map((t) => (
                    <div
                      key={t.tokenKey}
                      className="flex items-center gap-1.5 rounded border border-gray-100 px-2 py-1"
                    >
                      {type === 'color' && (
                        <div
                          className="h-3 w-3 rounded-sm border border-gray-200"
                          style={{ backgroundColor: t.tokenValue }}
                        />
                      )}
                      <span className="text-xs text-gray-600">{t.tokenKey.split('.').pop()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">No style pack assigned.</p>
            <Link
              href="/style-packs"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
            >
              Browse style packs
            </Link>
          </div>
        )}
      </div>

      {/* Components */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        {project.selectedRecipes.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {project.selectedRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/components/${r.id}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:shadow-sm"
              >
                <span className="font-medium text-gray-900">{r.name}</span>
                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                  {r.type}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">No components selected.</p>
            <Link
              href="/components"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
            >
              Browse components
            </Link>
          </div>
        )}
      </div>

      {/* Integration */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Claude Integration</h2>
        <div className="mt-3 space-y-4">
          {/* Step 1: MCP Config */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Add MCP Server</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Add to <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">.mcp.json</code> in
              your target project:
            </p>

            {/* Remote MCP (recommended) */}
            <div className="mt-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Recommended
                </span>
                <span className="text-xs font-medium text-gray-500">Remote — zero install</span>
              </div>
              <pre className="rounded-md bg-gray-900 p-4 text-xs text-gray-200 overflow-x-auto">
                {`{
  "mcpServers": {
    "aiui": {
      "type": "streamable-http",
      "url": "${process.env.NEXT_PUBLIC_MCP_URL ?? 'https://mcp.aiui.dev/mcp'}",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}
              </pre>
              <p className="mt-2 text-xs text-gray-400">
                <a href="/quick-setup" className="text-blue-600 hover:underline">
                  Quick Setup
                </a>{' '}
                — get an API key and connect in 30 seconds. Or{' '}
                <a href="/api-keys" className="text-blue-600 hover:underline">
                  manage API keys
                </a>{' '}
                to replace <code className="rounded bg-gray-100 px-1">YOUR_API_KEY</code> above.
              </p>
            </div>

            {/* Local MCP (self-hosted) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                Alternative: Local MCP (self-hosted)
              </summary>
              <pre className="mt-2 rounded-md bg-gray-900 p-4 text-xs text-gray-200 overflow-x-auto">
                {`{
  "mcpServers": {
    "aiui": {
      "command": "npx",
      "args": ["tsx", "<path-to-AIUI>/apps/mcp-server/src/index.ts"],
      "env": {
        "DATABASE_URL": "postgresql://aiui:aiui@127.0.0.1:5432/aiui"
      }
    }
  }
}`}
              </pre>
            </details>
          </div>

          {/* Step 2: Sync design memory */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Sync Design Memory</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Ask Claude to sync your design system. This creates persistent memory files that
              Claude reads automatically:
            </p>
            <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
              &quot;Sync the AIUI design memory for project <strong>{project.slug}</strong> to this
              directory&quot;
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Claude will call <code>sync_design_memory</code> which generates:
            </p>
            <ul className="mt-1 space-y-1 text-xs text-gray-500">
              <li>
                <code className="rounded bg-gray-100 px-1">.aiui/design-memory.md</code> — Full
                design context: tokens, components, rules
              </li>
              <li>
                <code className="rounded bg-gray-100 px-1">.aiui/tokens.json</code> —
                Machine-readable token values
              </li>
            </ul>
          </div>

          {/* Step 3: CLAUDE.md one-liner */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Add to CLAUDE.md</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Add this to your project&apos;s CLAUDE.md so Claude loads the design memory in every
              conversation:
            </p>
            <pre className="mt-3 rounded-md bg-gray-900 p-4 text-xs text-gray-200 overflow-x-auto">
              {`# Design System
This project uses AIUI for design management.
See \`.aiui/design-memory.md\` for the active design system — tokens, components, and rules.
Always follow the design rules defined there before building any UI.`}
            </pre>
          </div>

          {/* How it works */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <h3 className="text-sm font-semibold text-blue-900">How the Design Memory works</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">Persistent</div>
                <p className="mt-1 text-sm text-gray-700">
                  .aiui/ files live in your project repo. Claude reads them at the start of every
                  conversation.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">Dynamic</div>
                <p className="mt-1 text-sm text-gray-700">
                  Say &quot;re-sync design memory&quot; after changing your style pack or components
                  in AIUI. Files update from the database.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">Contextual</div>
                <p className="mt-1 text-sm text-gray-700">
                  Memory contains your exact token values, component list, and usage rules — not
                  generic instructions.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">Validated</div>
                <p className="mt-1 text-sm text-gray-700">
                  Claude calls validate_ui_output after generating code to check compliance with
                  your design system.
                </p>
              </div>
            </div>
          </div>

          {/* The flow */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">The flow</h3>
            <ol className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  1
                </span>
                <span>
                  You ask Claude to build UI — Claude reads{' '}
                  <code className="text-xs bg-gray-100 rounded px-1">.aiui/design-memory.md</code>{' '}
                  automatically
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  2
                </span>
                <span>
                  Claude knows your {project.tokens.length} tokens, {project.selectedRecipes.length}{' '}
                  components, and design rules from memory
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  3
                </span>
                <span>
                  Claude calls{' '}
                  <code className="text-xs bg-gray-100 rounded px-1">get_component_recipe</code> to
                  get the full code template for each component it needs
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  4
                </span>
                <span>
                  Claude generates on-brand code using your exact tokens and component patterns
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  5
                </span>
                <span>
                  Claude calls{' '}
                  <code className="text-xs bg-gray-100 rounded px-1">validate_ui_output</code> to
                  verify compliance — catches hardcoded colors and wrong fonts
                </span>
              </li>
            </ol>
          </div>

          {/* Quick test */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Try it</h3>
            <div className="mt-2 space-y-2">
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                &quot;Sync the AIUI design memory for <strong>{project.slug}</strong> to this
                project&quot;
              </div>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                &quot;Build a landing page using my design system&quot;
              </div>
              {project.selectedRecipes.length > 0 && (
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  &quot;Get the {project.selectedRecipes[0].name} recipe and build a{' '}
                  {project.selectedRecipes[0].type} section&quot;
                </div>
              )}
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                &quot;Re-sync design memory&quot;{' '}
                <span className="text-xs text-gray-400">— after changing your design in AIUI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
