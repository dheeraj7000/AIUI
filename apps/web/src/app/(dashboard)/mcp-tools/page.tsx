import Link from 'next/link';
import { BookOpen, Eye, Pencil, KeyRound, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata = { title: 'MCP Tools - AIUI' };
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToolCategory = 'read' | 'write';

interface CatalogTool {
  name: string;
  description: string;
  category: ToolCategory;
}

interface CatalogResponse {
  tools: CatalogTool[];
  count: number;
  generatedAt: string;
}

interface McpTool extends CatalogTool {
  example: string;
}

// ---------------------------------------------------------------------------
// Hardcoded example inputs — not part of the catalog endpoint response.
// Keys are tool names; values are illustrative example arguments.
// ---------------------------------------------------------------------------

const TOOL_EXAMPLES: Record<string, string> = {
  // Read tools
  get_project_context: `{ slug: "my-app" }`,
  resolve_tag: `{ projectSlug: "my-app", tag: "primary color" }`,
  list_components: `{ projectSlug: "my-app" }`,
  get_component_recipe: `{ recipeId: "abc-123" }`,
  get_theme_tokens: `{ projectSlug: "my-app" }`,
  get_asset_manifest: `{ projectSlug: "my-app" }`,
  validate_ui_output: `{ projectSlug: "my-app", code: "<your TSX>" }`,
  sync_design_memory: `{ slug: "my-app", targetDir: "/abs/path/to/repo" }`,
  get_design_memory: `{ slug: "my-app" }`,
  check_design_memory: `{ slug: "my-app" }`,
  open_design_studio: `{ slug: "my-app" }`,
  // Write tools
  init_project: `{ slug: "my-app", targetDir: "/abs/path/to/repo" }`,
  create_style_pack: `{ name: "Brand V2", slug: "brand-v2", tokens: [...] }`,
  apply_style_pack: `{ projectSlug: "my-app", stylePackSlug: "saas-clean-v1" }`,
  update_tokens: `{ projectSlug: "my-app", tokens: [{ key: "color.primary", value: "#4f46e5" }] }`,
  fix_compliance_issues: `{ projectSlug: "my-app", code: "<your TSX>" }`,
};

const GENERIC_EXAMPLE = `{ slug: "my-app" }`;

// ---------------------------------------------------------------------------
// Fallback catalog — used if the MCP catalog endpoint is unreachable.
// Mirrors the previous hardcoded list so the page still renders.
// ---------------------------------------------------------------------------

const FALLBACK_TOOLS: CatalogTool[] = [
  {
    name: 'get_project_context',
    description:
      'Fetch the full design context (tokens, components, framework, style pack) for a project by slug.',
    category: 'read',
  },
  {
    name: 'resolve_tag',
    description: 'Resolve a user-facing design tag (like "primary color") to a concrete token.',
    category: 'read',
  },
  {
    name: 'list_components',
    description: 'List all component recipes available in the project.',
    category: 'read',
  },
  {
    name: 'get_component_recipe',
    description: "Fetch one component recipe's code template and metadata.",
    category: 'read',
  },
  {
    name: 'get_theme_tokens',
    description: 'Return the design tokens grouped by type (color, spacing, radius, etc.).',
    category: 'read',
  },
  {
    name: 'get_asset_manifest',
    description: 'List uploaded assets (fonts, icons, images) for a project.',
    category: 'read',
  },
  {
    name: 'validate_ui_output',
    description:
      "Validate generated UI code against the project's design rules. Returns compliance violations.",
    category: 'read',
  },
  {
    name: 'sync_design_memory',
    description:
      'Write or update `.aiui/design-memory.md` and `tokens.json` into the repo. Returns a diff summary.',
    category: 'read',
  },
  {
    name: 'get_design_memory',
    description: 'Preview the design memory content without writing files.',
    category: 'read',
  },
  {
    name: 'check_design_memory',
    description: 'Check if the local design memory is fresh or stale.',
    category: 'read',
  },
  {
    name: 'open_design_studio',
    description: 'Return a URL to open the visual design studio for the project.',
    category: 'read',
  },
  {
    name: 'init_project',
    description:
      'Bootstrap a fresh project from scratch with the shadcn/ui Essentials starter pack, a seeded design profile, and initial .aiui/ files. Use this first on any new repo.',
    category: 'write',
  },
  {
    name: 'create_style_pack',
    description: 'Create a new private style pack in your organization.',
    category: 'write',
  },
  {
    name: 'apply_style_pack',
    description: 'Switch the project to a different style pack.',
    category: 'write',
  },
  {
    name: 'update_tokens',
    description: 'Modify one or more design tokens on the active style pack.',
    category: 'write',
  },
  {
    name: 'fix_compliance_issues',
    description: 'Auto-fix compliance violations in generated UI code.',
    category: 'write',
  },
];

// ---------------------------------------------------------------------------
// Catalog fetching
// ---------------------------------------------------------------------------

function getCatalogUrl(): string {
  const mcpUrl = process.env.NEXT_PUBLIC_MCP_URL ?? 'http://localhost:8080/mcp';
  // NEXT_PUBLIC_MCP_URL typically ends in /mcp — strip it and re-append /mcp/catalog
  const base = mcpUrl.replace(/\/mcp\/?$/, '');
  return `${base}/mcp/catalog`;
}

async function getCatalog(): Promise<{
  tools: CatalogTool[];
  generatedAt: string;
  fetchError: string | null;
}> {
  const url = getCatalogUrl();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return {
        tools: FALLBACK_TOOLS,
        generatedAt: new Date().toISOString(),
        fetchError: `HTTP ${res.status} ${res.statusText}`,
      };
    }
    const data = (await res.json()) as CatalogResponse;
    if (!Array.isArray(data?.tools)) {
      return {
        tools: FALLBACK_TOOLS,
        generatedAt: new Date().toISOString(),
        fetchError: 'Malformed catalog response',
      };
    }
    return {
      tools: data.tools,
      generatedAt: data.generatedAt ?? new Date().toISOString(),
      fetchError: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      tools: FALLBACK_TOOLS,
      generatedAt: new Date().toISOString(),
      fetchError: message,
    };
  }
}

function withExample(tool: CatalogTool): McpTool {
  return {
    ...tool,
    example: TOOL_EXAMPLES[tool.name] ?? GENERIC_EXAMPLE,
  };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function ToolCard({ tool }: { tool: McpTool }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm shadow-sm transition-colors hover:border-white/10">
      <div className="mb-2 flex items-center gap-2">
        <code className="font-mono text-base font-semibold text-white">{tool.name}</code>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">{tool.description}</p>
      <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-zinc-950/60 px-3 py-2 font-mono text-xs text-zinc-300">
        <code>{tool.example}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function McpToolsPage() {
  const { tools, generatedAt, fetchError } = await getCatalog();

  const readTools = tools.filter((t) => t.category === 'read').map(withExample);
  const writeTools = tools.filter((t) => t.category === 'write').map(withExample);

  let generatedAtDisplay: string;
  try {
    generatedAtDisplay = new Date(generatedAt).toLocaleString();
  } catch {
    generatedAtDisplay = generatedAt;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <BookOpen size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">MCP Tool Catalog</h1>
          <p className="text-sm text-zinc-400">
            These are the tools your MCP client (Claude Code, Cursor, VS Code, Windsurf) can call on
            your behalf. If you don&apos;t have an API key yet, create one at{' '}
            <Link href="/api-keys" className="text-indigo-400 hover:text-indigo-300">
              /api-keys
            </Link>{' '}
            first.
          </p>
        </div>
      </div>

      {/* CTA card */}
      <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
            <Sparkles size={20} className="text-indigo-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">New to MCP?</h2>
            <p className="mt-1 text-sm text-zinc-300">
              Start by creating an API key, then call{' '}
              <code className="rounded bg-zinc-900/80 px-1.5 py-0.5 font-mono text-xs text-indigo-300">
                init_project {`{ slug: 'my-app', targetDir: '/abs/path/to/repo' }`}
              </code>{' '}
              from your MCP client.
            </p>
            <Link
              href="/api-keys"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-md"
            >
              <KeyRound size={14} />
              Go to API Keys
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Fetch error warning */}
      {fetchError && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">
                Couldn&apos;t reach the MCP catalog endpoint. Showing fallback.
              </p>
              <p className="mt-1 font-mono text-xs text-red-400/80">Error: {fetchError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Read tools */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Eye size={18} className="text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Read tools</h2>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
            {readTools.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {readTools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>

      {/* Write tools */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Pencil size={18} className="text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Write tools</h2>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
            {writeTools.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {writeTools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>

      {/* Footnote */}
      <p className="mt-10 text-xs text-zinc-500">Catalog generated at {generatedAtDisplay}</p>
    </div>
  );
}
