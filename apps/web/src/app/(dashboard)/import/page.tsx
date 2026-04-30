'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  FileCode2,
  Braces,
  Wind,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Palette,
  Type,
  BoxSelect,
  Layers,
  Circle,
  Square,
} from 'lucide-react';
import { getActiveOrgId } from '@/lib/session';
import { TokenPreview } from '@/components/ui/TokenPreview';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportFormat = 'css' | 'tokens-studio' | 'tailwind';

interface ParsedToken {
  tokenKey: string;
  tokenType: string;
  tokenValue: string;
  description?: string;
}

interface PreviewData {
  fileName?: string;
  tokens: ParsedToken[];
  stats: Record<string, number>;
  warnings: string[];
}

type ImportState = 'idle' | 'loading' | 'preview' | 'importing' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'css' as const, label: 'CSS Variables', icon: FileCode2 },
  { id: 'tokens-studio' as const, label: 'Tokens Studio', icon: Braces },
  { id: 'tailwind' as const, label: 'Tailwind Config', icon: Wind },
];

type TabId = (typeof TABS)[number]['id'];

// ---------------------------------------------------------------------------
// Stat badge icon mapping
// ---------------------------------------------------------------------------

const statIcons: Record<string, typeof Palette> = {
  colors: Palette,
  color: Palette,
  fonts: Type,
  font: Type,
  shadows: Layers,
  shadow: Layers,
  spacing: Square,
  radius: Circle,
  radii: Circle,
  total: BoxSelect,
};

// ---------------------------------------------------------------------------
// Helper — authed fetch
// ---------------------------------------------------------------------------

async function authedFetch(url: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Token Preview Section
// ---------------------------------------------------------------------------

function TokenPreviewSection({ data }: { data: PreviewData }) {
  const colorTokens = data.tokens.filter((t) => t.tokenType === 'color');
  const fontTokens = data.tokens.filter((t) => t.tokenType === 'font');

  const statEntries = Object.entries(data.stats).filter(([key, val]) => key !== 'total' && val > 0);
  const totalCount = data.stats.total ?? data.tokens.length;

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      {/* Stats badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          {totalCount} total tokens
        </span>
        {statEntries.map(([key, val]) => {
          const Icon = statIcons[key] ?? BoxSelect;
          return (
            <span
              key={key}
              className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              <Icon size={12} />
              {val} {key}
            </span>
          );
        })}
      </div>

      {/* Color swatches */}
      {colorTokens.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Colors
          </h4>
          <div className="flex flex-wrap gap-3">
            {colorTokens.slice(0, 24).map((t) => (
              <TokenPreview
                key={t.tokenKey}
                tokenKey={t.tokenKey}
                tokenType={t.tokenType}
                tokenValue={t.tokenValue}
              />
            ))}
            {colorTokens.length > 24 && (
              <span className="flex items-center text-xs text-zinc-500">
                +{colorTokens.length - 24} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Font samples */}
      {fontTokens.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Fonts
          </h4>
          <div className="flex flex-wrap gap-3">
            {fontTokens.slice(0, 8).map((t) => (
              <TokenPreview
                key={t.tokenKey}
                tokenKey={t.tokenKey}
                tokenType={t.tokenType}
                tokenValue={t.tokenValue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <AlertTriangle size={16} />
            {data.warnings.length} warning{data.warnings.length !== 1 ? 's' : ''}
          </div>
          <ul className="mt-2 space-y-1">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-400/80">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manual Format Tab Content (CSS, Tokens Studio, Tailwind)
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<ImportFormat, string> = {
  css: 'CSS variables',
  'tokens-studio': 'Tokens Studio JSON',
  tailwind: 'Tailwind config',
};

const FORMAT_PLACEHOLDERS: Record<ImportFormat, string> = {
  css: `:root {\n  --color-primary: #3B82F6;\n  --color-secondary: #10B981;\n  --font-sans: 'Inter', sans-serif;\n  --radius-md: 8px;\n}`,
  'tokens-studio': `{\n  "colors": {\n    "primary": {\n      "value": "#3B82F6",\n      "type": "color"\n    }\n  }\n}`,
  tailwind: `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '#3B82F6',\n      },\n    },\n  },\n}`,
};

function ManualFormatTab({ format }: { format: ImportFormat }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [state, setState] = useState<ImportState>('idle');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState('');

  const handlePreview = useCallback(async () => {
    if (!content) return;
    setState('loading');
    setError('');
    setPreview(null);

    try {
      const res = await authedFetch('/api/imports/tokens/preview', {
        content,
        format,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse tokens');
      }

      const data: PreviewData = await res.json();
      setPreview(data);
      setState('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  }, [content, format]);

  const handleImport = useCallback(async () => {
    if (!content || !projectId) return;
    setState('importing');
    setError('');

    const orgId = getActiveOrgId();

    try {
      const res = await authedFetch('/api/imports/tokens', {
        content,
        format,
        projectId,
        organizationId: orgId,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to import tokens');
      }

      setState('success');
      setTimeout(() => {
        router.push(`/projects`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  }, [content, format, projectId, router]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${format}-content`} className="block text-sm font-medium text-zinc-400">
          Paste your {FORMAT_LABELS[format]}
        </label>
        <textarea
          id={`${format}-content`}
          rows={10}
          placeholder={FORMAT_PLACEHOLDERS[format]}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor={`${format}-project`} className="block text-sm font-medium text-zinc-400">
          Target Project ID
        </label>
        <input
          id={`${format}-project`}
          type="text"
          placeholder="Paste a project UUID from /projects"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {/* TODO: rebuild without style packs — wire a project picker once /projects exposes IDs */}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          <CheckCircle2 size={16} />
          Import successful! Redirecting...
        </div>
      )}

      <div className="flex items-center gap-3">
        {state !== 'preview' && state !== 'importing' && state !== 'success' && (
          <button
            onClick={handlePreview}
            disabled={!content || state === 'loading'}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === 'loading' && <Loader2 size={16} className="animate-spin" />}
            Parse & Preview
          </button>
        )}

        {state === 'preview' && (
          <>
            <button
              onClick={handleImport}
              disabled={!projectId}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Import Tokens
            </button>
            <button
              onClick={() => {
                setState('idle');
                setPreview(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-700"
            >
              Cancel
            </button>
          </>
        )}

        {state === 'importing' && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Importing tokens...
          </div>
        )}
      </div>

      {preview && <TokenPreviewSection data={preview} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Import Page
// ---------------------------------------------------------------------------

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<TabId>('css');

  return (
    <div>
      <div className="flex items-center gap-3">
        <Download size={24} className="text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">Import Design Tokens</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Paste CSS variables, Tokens Studio JSON, or a Tailwind config
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-zinc-800">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'css' && <ManualFormatTab format="css" />}
        {activeTab === 'tokens-studio' && <ManualFormatTab format="tokens-studio" />}
        {activeTab === 'tailwind' && <ManualFormatTab format="tailwind" />}
      </div>
    </div>
  );
}
