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

const CORE_GUIDELINES = `## Core Design Rules
1. **Always use design tokens** — never hardcode colors, spacing, or font values
2. **Follow the component library** — use provided component recipes before creating new ones
3. **Maintain visual hierarchy** — use heading scale, consistent spacing, proper contrast
4. **Respect the type system** — use the font families, sizes, and weights defined in tokens
5. **Use the spacing scale** — follow the spacing tokens for margin, padding, and gap
6. **Maintain accessibility** — meet WCAG 2.1 AA requirements for contrast and text sizing
7. **Preserve design consistency** — match the design system's visual language across all screens`;

const ACCESSIBILITY_SECTION = `## Accessibility Requirements
- **Color Contrast:** Normal text requires 4.5:1 ratio (WCAG AA). Large text (18px+ or 14px+ bold) requires 3:1.
- **Font Sizing:** Body text minimum 16px. Never use font sizes below 12px.
- **Touch Targets:** Interactive elements minimum 44x44px.
- **Focus Indicators:** All interactive elements must have visible focus states.
- **Semantic HTML:** Use proper heading hierarchy (h1 > h2 > h3). Use landmark elements (nav, main, aside).`;

const TOKEN_COMPLIANCE_SECTION = `## Token Compliance
- Only use token values defined in the project's style pack
- Do not hardcode hex colors — use token references (e.g., \`text-primary\` not \`text-[#3b82f6]\`)
- Do not hardcode spacing — use token references (e.g., \`p-4\` not \`p-[16px]\`)
- Custom values are acceptable ONLY when no token matches the design intent`;

const RESPONSIVE_SECTION = `## Responsive Design
- Mobile-first approach: base styles for mobile, breakpoints for larger screens
- Use the defined breakpoint tokens for media queries
- Test at minimum: 375px (mobile), 768px (tablet), 1280px (desktop)`;

/**
 * GET /llm/guidelines?project=<slug>
 *
 * Returns design guidelines as AI-optimized markdown documentation.
 * The project parameter is optional — without it, generic guidelines are returned.
 */
export async function GET(req: NextRequest) {
  const projectSlug = req.nextUrl.searchParams.get('project');

  try {
    const lines: string[] = [];
    lines.push('# Design Guidelines');
    lines.push('');
    lines.push(CORE_GUIDELINES);
    lines.push('');
    lines.push(ACCESSIBILITY_SECTION);
    lines.push('');
    lines.push(TOKEN_COMPLIANCE_SECTION);
    lines.push('');
    lines.push(RESPONSIVE_SECTION);

    // If a project is provided, add project-specific token constraints
    if (projectSlug) {
      const db = getDb();
      const result = await authenticateLlmRequest(req, db, projectSlug);

      if (!isAuthError(result)) {
        const { project, tokens } = result;

        if (tokens.length > 0) {
          lines.push('');
          lines.push(`## Available Tokens — ${project.name}`);
          lines.push('');
          lines.push(
            "The following token values are defined in this project's style pack. Use these instead of hardcoded values."
          );

          // Group tokens by type
          const grouped = new Map<string, typeof tokens>();
          for (const token of tokens) {
            const group = grouped.get(token.tokenType) ?? [];
            group.push(token);
            grouped.set(token.tokenType, group);
          }

          for (const tokenType of TOKEN_TYPE_ORDER) {
            const group = grouped.get(tokenType);
            if (!group || group.length === 0) continue;

            lines.push('');
            lines.push(`### ${TOKEN_TYPE_LABELS[tokenType] ?? tokenType}`);

            for (const token of group) {
              lines.push(`- \`${token.tokenKey}\`: ${token.tokenValue}`);
            }
          }
        }
      }
      // If auth fails for the project, we still return generic guidelines without error
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
    console.error('Failed to generate guidelines documentation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
