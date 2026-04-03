import Link from 'next/link';
import { createDb, stylePacks, componentRecipes, projects } from '@aiui/design-core';
import { count } from 'drizzle-orm';

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

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/style-packs"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="text-3xl font-bold text-gray-900">{stats.packs}</div>
          <div className="text-sm text-gray-500">Style Packs</div>
        </Link>
        <Link
          href="/components"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="text-3xl font-bold text-gray-900">{stats.recipes}</div>
          <div className="text-sm text-gray-500">Component Recipes</div>
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">{stats.projects}</div>
          <div className="text-sm text-gray-500">Projects</div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        </div>

        {stats.recentProjects.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                <p className="mt-1 text-xs text-gray-400">/{p.slug}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">No projects yet.</p>
            <p className="mt-1 text-xs text-gray-400">
              Projects are created via the API. Browse{' '}
              <Link href="/style-packs" className="text-blue-600 hover:underline">
                Style Packs
              </Link>{' '}
              and{' '}
              <Link href="/components" className="text-blue-600 hover:underline">
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
