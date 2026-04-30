import type { CreateTokenInput } from '../../validation/style-token';

/**
 * The token set seeded into every brand-new project by `init_project`.
 *
 * After the style-pack/component scope cut, this replaces the 14 starter
 * packs — every project starts with this minimal, tasteful base set and
 * the user replaces values via the studio or `update_tokens` MCP tool.
 *
 * Keep this small. The point is to have a usable starting palette,
 * spacing scale, type stack, and radii — not to be opinionated about
 * a specific aesthetic.
 */
export const DEFAULT_PROJECT_TOKENS: CreateTokenInput[] = [
  // ── Color ────────────────────────────────────────────────────────────────
  {
    tokenKey: 'color.primary',
    tokenType: 'color',
    tokenValue: '#0F172A',
    description: 'Primary action / brand color',
  },
  {
    tokenKey: 'color.background',
    tokenType: 'color',
    tokenValue: '#FFFFFF',
    description: 'Default surface background',
  },
  {
    tokenKey: 'color.foreground',
    tokenType: 'color',
    tokenValue: '#0F172A',
    description: 'Default text color',
  },
  {
    tokenKey: 'color.muted',
    tokenType: 'color',
    tokenValue: '#F1F5F9',
    description: 'Subtle background (cards, inputs)',
  },
  {
    tokenKey: 'color.muted-foreground',
    tokenType: 'color',
    tokenValue: '#64748B',
    description: 'Secondary text',
  },
  {
    tokenKey: 'color.accent',
    tokenType: 'color',
    tokenValue: '#3B82F6',
    description: 'Accent / highlights',
  },
  {
    tokenKey: 'color.border',
    tokenType: 'color',
    tokenValue: '#E2E8F0',
    description: 'Hairline borders',
  },
  {
    tokenKey: 'color.destructive',
    tokenType: 'color',
    tokenValue: '#EF4444',
    description: 'Error / destructive state',
  },

  // ── Typography ────────────────────────────────────────────────────────────
  {
    tokenKey: 'font.sans',
    tokenType: 'font',
    tokenValue: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    description: 'Default body font stack',
  },
  {
    tokenKey: 'font.mono',
    tokenType: 'font',
    tokenValue: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
    description: 'Monospace stack',
  },

  // ── Spacing ───────────────────────────────────────────────────────────────
  { tokenKey: 'spacing.xs', tokenType: 'spacing', tokenValue: '0.25rem' },
  { tokenKey: 'spacing.sm', tokenType: 'spacing', tokenValue: '0.5rem' },
  { tokenKey: 'spacing.md', tokenType: 'spacing', tokenValue: '1rem' },
  { tokenKey: 'spacing.lg', tokenType: 'spacing', tokenValue: '1.5rem' },
  { tokenKey: 'spacing.xl', tokenType: 'spacing', tokenValue: '2rem' },

  // ── Radius ────────────────────────────────────────────────────────────────
  { tokenKey: 'radius.sm', tokenType: 'radius', tokenValue: '4px' },
  { tokenKey: 'radius.md', tokenType: 'radius', tokenValue: '8px' },
  { tokenKey: 'radius.lg', tokenType: 'radius', tokenValue: '12px' },
];
