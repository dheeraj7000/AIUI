import Link from 'next/link';
import { createDb, stylePacks, componentRecipes, projects, apiKeys } from '@aiui/design-core';
import { count, eq, or } from 'drizzle-orm';
import { Palette, LayoutGrid, FolderOpen, ArrowRight, Inbox, Key, Download } from 'lucide-react';
import { getUserOrg } from '@/lib/get-user-org';
import { OnboardingChecklist } from '@/components/ui/onboarding-checklist';

export const metadata = { title: 'Dashboard - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getStats() {
  const db = getDb();
  const userOrg = await getUserOrg();
  const orgId = userOrg?.organizationId;

  // Style packs: user's org packs + public packs
  const [packCount] = orgId
    ? await db
        .select({ count: count() })
        .from(stylePacks)
        .where(or(eq(stylePacks.organizationId, orgId), eq(stylePacks.isPublic, true)))
    : await db.select({ count: count() }).from(stylePacks).where(eq(stylePacks.isPublic, true));

  // Component recipes: scoped to org or null org (public seed data)
  const [recipeCount] = orgId
    ? await db
        .select({ count: count() })
        .from(componentRecipes)
        .innerJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
        .where(or(eq(stylePacks.organizationId, orgId), eq(stylePacks.isPublic, true)))
    : await db
        .select({ count: count() })
        .from(componentRecipes)
        .innerJoin(stylePacks, eq(componentRecipes.stylePackId, stylePacks.id))
        .where(eq(stylePacks.isPublic, true));

  // Projects: scoped to org
  const [projectCount] = orgId
    ? await db.select({ count: count() }).from(projects).where(eq(projects.organizationId, orgId))
    : [{ count: 0 }];

  // Recent projects: scoped to org
  const recentProjects = orgId
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, orgId))
        .orderBy(projects.createdAt)
        .limit(6)
    : [];

  // Check onboarding state
  const hasApiKey = orgId
    ? (
        await db.select({ count: count() }).from(apiKeys).where(eq(apiKeys.organizationId, orgId))
      )[0]?.count > 0
    : false;

  return {
    packs: packCount?.count ?? 0,
    recipes: recipeCount?.count ?? 0,
    projects: projectCount?.count ?? 0,
    recentProjects,
    hasApiKey,
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

      <div className="mt-6">
        <OnboardingChecklist
          hasProject={stats.projects > 0}
          hasStylePack={stats.packs > 0}
          hasApiKey={stats.hasApiKey}
          hasComponent={stats.recipes > 0}
        />
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
            href="/api-keys"
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10">
                <Key size={20} className="text-lime-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">API Keys</h3>
                <p className="text-xs text-zinc-400">
                  Create an API key and connect your AI coding assistant
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
