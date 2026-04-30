import Link from 'next/link';
import { createDb, projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getUserOrg } from '@/lib/get-user-org';
import { CreateProjectButton } from '@/components/ui/create-project-button';

export const metadata = { title: 'Projects - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getProjects() {
  const db = getDb();
  const userOrg = await getUserOrg();
  const orgId = userOrg?.organizationId;

  if (!orgId) return [];

  const all = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      frameworkTarget: projects.frameworkTarget,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.organizationId, orgId))
    .orderBy(projects.createdAt);
  return all;
}

export default async function ProjectsPage() {
  const [allProjects, userOrg] = await Promise.all([getProjects(), getUserOrg()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {allProjects.length} project{allProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {userOrg && <CreateProjectButton orgId={userOrg.organizationId} />}
      </div>

      {allProjects.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg"
            >
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {p.name}
              </h3>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{p.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                  {p.frameworkTarget}
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">/{p.slug}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-sm font-medium text-zinc-300">No projects yet</p>
          <p className="mt-2 text-xs text-zinc-500">
            Create a project to seed default tokens and get your MCP integration guide.
          </p>
          {userOrg && (
            <div className="mt-6 flex justify-center">
              <CreateProjectButton orgId={userOrg.organizationId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
