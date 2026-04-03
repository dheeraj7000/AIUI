export const fintechLightV1 = {
  pack: {
    name: 'Fintech Light',
    slug: 'fintech-light-v1',
    category: 'fintech',
    description: 'Trust-oriented design system for fintech dashboards with data-dense layouts',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#1E40AF' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#1D4ED8' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#0F766E' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#F8FAFC' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#0F172A' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#475569' },
    { tokenKey: 'color.positive', tokenType: 'color' as const, tokenValue: '#16A34A' },
    { tokenKey: 'color.negative', tokenType: 'color' as const, tokenValue: '#DC2626' },
    { tokenKey: 'color.chart-1', tokenType: 'color' as const, tokenValue: '#3B82F6' },
    { tokenKey: 'color.chart-2', tokenType: 'color' as const, tokenValue: '#10B981' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '4px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '6px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'IBM Plex Mono' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '12px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '32px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 2px 4px -1px rgb(0 0 0 / 0.06)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 8px -2px rgb(0 0 0 / 0.08)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 1px 2px rgb(0 0 0 / 0.04)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 2px 4px rgb(0 0 0 / 0.06)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 4px 8px rgb(0 0 0 / 0.08)',
    },
  ],
  recipes: [
    {
      name: 'Dashboard Header',
      type: 'header' as const,
      codeTemplate: `<header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between"><div className="flex items-center gap-4"><span className="font-bold text-lg text-slate-900">{logo}</span>{breadcrumb}</div><div className="flex items-center gap-3">{notifications}{userMenu}</div></header>`,
      jsonSchema: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          breadcrumb: { type: 'string' },
          notifications: { type: 'object' },
          userMenu: { type: 'object' },
        },
      },
      aiUsageRules:
        'Compact header for dashboard views. Include breadcrumb navigation and notification bell.',
    },
    {
      name: 'Metric Card',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-lg border border-slate-200 p-6"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span>{icon}</div><div className="mt-2 text-3xl font-bold text-slate-900">{value}</div><div className="mt-1 flex items-center text-sm"><span className="{changeColor}">{changeIcon} {changeValue}</span><span className="ml-2 text-slate-500">vs last period</span></div></div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          changeValue: { type: 'string' },
          changeColor: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use green for positive changes, red for negative. Show percentage or absolute change.',
    },
    {
      name: 'Transaction List',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-lg border border-slate-200"><div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><h3 className="font-semibold text-slate-900">{title}</h3>{filters}</div><div className="divide-y divide-slate-100">{transactions}</div></div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          filters: { type: 'object' },
          transactions: { type: 'array' },
        },
      },
      aiUsageRules:
        'Each transaction shows date, description, category badge, and amount. Use mono font for amounts.',
    },
    {
      name: 'Account Summary',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-lg border border-slate-200 p-6"><h3 className="font-semibold text-slate-900">{title}</h3><div className="mt-4 space-y-4">{accounts}</div><div className="mt-6 pt-4 border-t border-slate-200 flex justify-between"><span className="font-medium text-slate-700">Total</span><span className="font-bold text-slate-900">{total}</span></div></div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          accounts: { type: 'array' },
          total: { type: 'string' },
        },
      },
      aiUsageRules:
        'Show checking, savings, and investment accounts with balances. Use mono font for numbers.',
    },
    {
      name: 'Fintech Feature Grid',
      type: 'feature' as const,
      codeTemplate: `<section className="py-16"><div className="mx-auto max-w-7xl px-6"><h2 className="text-2xl font-bold text-slate-900">{title}</h2><div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">{features}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: { title: { type: 'string' }, features: { type: 'array' } },
      },
      aiUsageRules: 'Emphasize security, reliability, and compliance in feature descriptions.',
    },
    {
      name: 'Fintech CTA',
      type: 'cta' as const,
      codeTemplate: `<section className="bg-blue-900 py-16 rounded-2xl mx-6"><div className="mx-auto max-w-3xl text-center"><h2 className="text-3xl font-bold text-white">{headline}</h2><p className="mt-4 text-blue-200">{description}</p><a href="{ctaLink}" className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-900">{ctaText}</a></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          description: { type: 'string' },
          ctaText: { type: 'string' },
          ctaLink: { type: 'string' },
        },
      },
      aiUsageRules: 'Use trust-building language. Mention security certifications if applicable.',
    },
  ],
};
