import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createDb, projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { ProjectGraph } from '@/components/graph/ProjectGraph';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

async function getProject(slug: string) {
  const db = getDb();
  const [project] = await db
    .select({ id: projects.id, name: projects.name, slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  return project ?? null;
}

type RouteContext = { params: Promise<{ slug: string }> };

export default async function ProjectGraphPage(props: RouteContext) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb and header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/projects" className="hover:text-gray-600">
              Projects
            </Link>
            <span>/</span>
            <Link href={`/projects/${project.slug}`} className="hover:text-gray-600">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-gray-600">Graph</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Project Graph</h1>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="min-h-0 flex-1">
        <ProjectGraph projectId={project.id} />
      </div>
    </div>
  );
}
