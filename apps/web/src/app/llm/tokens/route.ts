import { NextRequest, NextResponse } from 'next/server';
import { authenticateLlmRequest, isAuthError, getDb } from '../lib/auth';

const TOKEN_TYPE_ORDER = [
  'color',
  'font',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'spacing',
  'radius',
  'shadow',
  'elevation',
  'z-index',
  'opacity',
  'border-width',
  'breakpoint',
  'animation',
  'transition',
] as const;

const TOKEN_TYPE_LABELS: Record<string, string> = {
  color: 'Colors',
  font: 'Fonts',
  'font-size': 'Font Sizes',
  'font-weight': 'Font Weights',
  'line-height': 'Line Heights',
  'letter-spacing': 'Letter Spacing',
  spacing: 'Spacing',
  radius: 'Border Radii',
  shadow: 'Shadows',
  elevation: 'Elevation',
  'z-index': 'Z-Index',
  opacity: 'Opacity',
  'border-width': 'Border Widths',
  breakpoint: 'Breakpoints',
  animation: 'Animations',
  transition: 'Transitions',
};

/**
 * GET /llm/tokens?project=<slug>
 *
 * Returns design tokens as AI-optimized markdown documentation.
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

    const { project, stylePack, tokens } = result;

    // Group tokens by type
    const grouped = new Map<string, typeof tokens>();
    for (const token of tokens) {
      const group = grouped.get(token.tokenType) ?? [];
      group.push(token);
      grouped.set(token.tokenType, group);
    }

    // Build markdown
    const lines: string[] = [];
    lines.push(`# Design Tokens — ${project.name}`);
    lines.push('');
    lines.push(`Style Pack: ${stylePack.name} (${stylePack.category})`);
    lines.push(`Token Count: ${tokens.length}`);
    lines.push(`Generated: ${new Date().toISOString()}`);

    for (const tokenType of TOKEN_TYPE_ORDER) {
      const group = grouped.get(tokenType);
      if (!group || group.length === 0) continue;

      lines.push('');
      lines.push(`## ${TOKEN_TYPE_LABELS[tokenType] ?? tokenType}`);
      lines.push('| Token | Value | Description |');
      lines.push('|-------|-------|-------------|');

      for (const token of group) {
        const desc = token.description ?? '';
        lines.push(`| ${token.tokenKey} | ${token.tokenValue} | ${desc} |`);
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
    console.error('Failed to generate token documentation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
