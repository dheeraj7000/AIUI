import Link from 'next/link';
import { createDb, projects, apiKeys, styleTokens } from '@aiui/design-core';
import { count, eq } from 'drizzle-orm';
import { FolderOpen, ArrowRight, Inbox, Key, Download, Palette } from 'lucide-react';
import { getUserOrg } from '@/lib/get-user-org';
import { OnboardingChecklist } from '@/components/ui/onboarding-checklist';
import { McpWalkthrough } from '@/components/ui/mcp-walkthrough';
import { CreateProjectButton } from '@/components/ui/create-project-button';

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

  // Token count: sum across all projects in the org (project-scoped after scope cut).
  // Cheap proxy — gives the dashboard something concrete to display now that
  // packs/recipes no longer exist as top-level resources.
  let tokenCount = 0;
  if (orgId && recentProjects.length > 0) {
    const ids = recentProjects.map((p) => p.id);
    // We only count tokens for the recent slice; if you want the global
    // total, do a join here. Avoiding for now to keep this query fast.
    const tokenCounts = await Promise.all(
      ids.map(async (id) => {
        const [r] = await db
          .select({ count: count() })
          .from(styleTokens)
          .where(eq(styleTokens.projectId, id));
        return r?.count ?? 0;
      })
    );
    tokenCount = tokenCounts.reduce((sum, n) => sum + n, 0);
  }

  // Check onboarding state
  const hasApiKey = orgId
    ? (
        await db.select({ count: count() }).from(apiKeys).where(eq(apiKeys.organizationId, orgId))
      )[0]?.count > 0
    : false;

  return {
    tokens: tokenCount,
    projects: projectCount?.count ?? 0,
    recentProjects,
    hasApiKey,
  };
}

const statCards = [
  {
    label: 'Projects',
    key: 'projects' as const,
    href: '/projects',
    icon: FolderOpen,
    iconColor: 'text-emerald-400',
    glowColor: 'group-hover:shadow-emerald-500/10',
    bgColor: 'bg-emerald-500/10',
    borderHover: 'hover:border-emerald-500/20',
  },
  {
    label: 'Design Tokens',
    key: 'tokens' as const,
    href: '/projects',
    icon: Palette,
    iconColor: 'text-blue-400',
    glowColor: 'group-hover:shadow-blue-500/10',
    bgColor: 'bg-blue-500/10',
    borderHover: 'hover:border-blue-500/20',
  },
];

export default async function DashboardPage() {
  const [stats, userOrg] = await Promise.all([getStats(), getUserOrg()]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your design system and projects</p>
        </div>
        {userOrg && <CreateProjectButton orgId={userOrg.organizationId} />}
      </div>

      {/* Onboarding */}
      <div className="mt-6 space-y-4">
        <McpWalkthrough hasApiKey={stats.hasApiKey} hasProject={stats.projects > 0} />
        <OnboardingChecklist hasProject={stats.projects > 0} hasApiKey={stats.hasApiKey} />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className={`group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:shadow-xl ${card.glowColor} ${card.borderHover}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgColor} border border-white/5`}
                >
                  <Icon size={20} className={card.iconColor} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-400"
                />
              </div>
              <div className="mt-4 text-3xl font-bold text-white">{stats[card.key]}</div>
              <div className="mt-0.5 text-sm text-zinc-500">{card.label}</div>
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
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/10">
                <Key size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  API Keys
                </h3>
                <p className="text-xs text-zinc-500">
                  Create an API key and connect your AI coding assistant
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/import"
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/10">
                <Download size={20} className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">
                  Import Tokens
                </h3>
                <p className="text-xs text-zinc-500">
                  Import design tokens from CSS, Tokens Studio, or Tailwind
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <div className="flex items-center gap-3">
            {userOrg && (
              <CreateProjectButton orgId={userOrg.organizationId} variant="outline" label="New" />
            )}
            {stats.recentProjects.length > 0 && (
              <Link
                href="/projects"
                className="group flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                View all
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </div>

        {stats.recentProjects.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                    <FolderOpen
                      size={18}
                      className="text-zinc-400 group-hover:text-indigo-400 transition-colors"
                    />
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
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/5">
              <Inbox size={24} className="text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400">No projects yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Create your first project — default tokens are seeded for you.
            </p>
            {userOrg && (
              <div className="mt-5 flex justify-center">
                <CreateProjectButton orgId={userOrg.organizationId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
