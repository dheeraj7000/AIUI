import Link from 'next/link';
import { createDb, projects, stylePacks } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getUserOrg } from '@/lib/get-user-org';

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
      activeStylePackId: projects.activeStylePackId,
      createdAt: projects.createdAt,
      packName: stylePacks.name,
    })
    .from(projects)
    .leftJoin(stylePacks, eq(projects.activeStylePackId, stylePacks.id))
    .where(eq(projects.organizationId, orgId))
    .orderBy(projects.createdAt);
  return all;
}

export default async function ProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {allProjects.length} project{allProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {allProjects.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-white">{p.name}</h3>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{p.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {p.frameworkTarget}
                </span>
                {p.packName && (
                  <span className="rounded-full bg-lime-500/10 px-2 py-0.5 text-xs text-lime-400">
                    {p.packName}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-zinc-500">/{p.slug}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
          <p className="text-sm text-zinc-400">No projects yet.</p>
          <p className="mt-2 text-xs text-zinc-500">
            Go to a{' '}
            <Link href="/style-packs" className="text-lime-400 hover:underline">
              Style Pack
            </Link>{' '}
            or{' '}
            <Link href="/components" className="text-lime-400 hover:underline">
              Component
            </Link>{' '}
            and click &quot;Add to Project&quot; to create one.
          </p>
        </div>
      )}
    </div>
  );
}
