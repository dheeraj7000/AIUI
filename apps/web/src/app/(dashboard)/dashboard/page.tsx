import Link from 'next/link';
import { createDb, stylePacks, componentRecipes, projects } from '@aiui/design-core';
import { count } from 'drizzle-orm';
import { Palette, LayoutGrid, FolderOpen, ArrowRight, Inbox, Zap, Download } from 'lucide-react';

export const metadata = { title: 'Dashboard - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getStats() {
  const db = getDb();
  const [packCount] = await db.select({ count: count() }).from(stylePacks);
  const [recipeCount] = await db.select({ count: count() }).from(componentRecipes);
  const [projectCount] = await db.select({ count: count() }).from(projects);

  const recentProjects = await db.select().from(projects).orderBy(projects.createdAt).limit(6);

  return {
    packs: packCount?.count ?? 0,
    recipes: recipeCount?.count ?? 0,
    projects: projectCount?.count ?? 0,
    recentProjects,
  };
}

const statCards = [
  {
    label: 'Style Packs',
    key: 'packs' as const,
    href: '/style-packs',
    icon: Palette,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Component Recipes',
    key: 'recipes' as const,
    href: '/components',
    icon: LayoutGrid,
    gradient: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    label: 'Projects',
    key: 'projects' as const,
    href: '/projects',
    icon: FolderOpen,
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
];

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgLight}`}
                >
                  <Icon size={20} className={card.iconColor} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-400"
                />
              </div>
              <div className="mt-3 text-3xl font-bold text-white">{stats[card.key]}</div>
              <div className="text-sm text-zinc-400">{card.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/quick-setup"
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Zap size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Quick Setup</h3>
                <p className="text-xs text-zinc-400">
                  Get an API key and connect your AI assistant in 30 seconds
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/import"
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
                <Download size={20} className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Import Tokens</h3>
                <p className="text-xs text-zinc-400">
                  Import design tokens from Figma, CSS, or Tailwind
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          {stats.recentProjects.length > 0 && (
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm font-medium text-lime-400 transition-colors hover:text-lime-300"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {stats.recentProjects.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                    <FolderOpen size={18} className="text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-zinc-500">/{p.slug}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
              <Inbox size={24} className="text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400">No projects yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Projects are created via the API. Browse{' '}
              <Link href="/style-packs" className="text-lime-400 hover:underline">
                Style Packs
              </Link>{' '}
              and{' '}
              <Link href="/components" className="text-lime-400 hover:underline">
                Components
              </Link>{' '}
              to explore your design library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
