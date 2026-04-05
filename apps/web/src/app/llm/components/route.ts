import { NextRequest, NextResponse } from 'next/server';
import { authenticateLlmRequest, isAuthError, getDb } from '../lib/auth';

const TIER_ORDER = ['atom', 'molecule', 'organism', 'template'] as const;

const TIER_LABELS: Record<string, string> = {
  atom: 'Atoms',
  molecule: 'Molecules',
  organism: 'Organisms',
  template: 'Templates',
};

function truncate(value: string | null | undefined, maxLength: number): string {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
}

/**
 * GET /llm/components?project=<slug>
 *
 * Returns component recipes as AI-optimized markdown documentation.
 */
export async function GET(req: NextRequest) {
  const projectSlug = req.nextUrl.searchParams.get('project');
  if (!projectSlug) {
    return NextResponse.json({ error: 'project query parameter is required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const result = await authenticateLlmRequest(req, db, projectSlug);

    if (isAuthError(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { project, stylePack, components } = result;

    // Group components by tier
    const grouped = new Map<string, typeof components>();
    for (const component of components) {
      const tier = component.tier ?? 'atom';
      const group = grouped.get(tier) ?? [];
      group.push(component);
      grouped.set(tier, group);
    }

    // Build markdown
    const lines: string[] = [];
    lines.push(`# Component Library — ${project.name}`);
    lines.push('');
    lines.push(`Style Pack: ${stylePack.name}`);
    lines.push(`Component Count: ${components.length}`);

    for (const tier of TIER_ORDER) {
      const group = grouped.get(tier);
      if (!group || group.length === 0) continue;

      lines.push('');
      lines.push(`## ${TIER_LABELS[tier] ?? tier}`);

      for (const component of group) {
        lines.push('');
        lines.push(`### ${component.name}`);
        lines.push(`- **Type:** ${component.type}`);
        lines.push(`- **Tier:** ${component.tier ?? 'atom'}`);

        if (component.aiUsageRules) {
          lines.push(`- **AI Usage Rules:** ${component.aiUsageRules}`);
        }

        const schemaStr = truncate(JSON.stringify(component.jsonSchema, null, 2), 500);
        if (schemaStr) {
          lines.push(`- **Props Schema:** ${schemaStr}`);
        }

        if (component.codeTemplate) {
          lines.push('- **Code Template:**');
          lines.push('```tsx');
          lines.push(truncate(component.codeTemplate, 1000));
          lines.push('```');
        }
      }
    }

    const markdown = lines.join('\n');

    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to generate component documentation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
