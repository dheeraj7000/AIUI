import Link from 'next/link';
import { createDb, projects, stylePacks } from '@aiui/design-core';
import { eq } from 'drizzle-orm';

export const metadata = { title: 'Projects - AIUI' };
export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getProjects() {
  const db = getDb();
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
    .orderBy(projects.createdAt);
  return all;
}

export default async function ProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
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
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {p.frameworkTarget}
                </span>
                {p.packName && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    {p.packName}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">/{p.slug}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No projects yet.</p>
          <p className="mt-2 text-xs text-gray-400">
            Go to a{' '}
            <Link href="/style-packs" className="text-blue-600 hover:underline">
              Style Pack
            </Link>{' '}
            or{' '}
            <Link href="/components" className="text-blue-600 hover:underline">
              Component
            </Link>{' '}
            and click &quot;Add to Project&quot; to create one.
          </p>
        </div>
      )}
    </div>
  );
}
