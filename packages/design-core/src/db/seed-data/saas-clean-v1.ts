export const saasCleanV1 = {
  pack: {
    name: 'SaaS Clean',
    slug: 'saas-clean-v1',
    category: 'saas',
    description: 'Clean, professional SaaS design system with neutral tones and clear hierarchy',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#3B82F6' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#2563EB' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#6B7280' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#8B5CF6' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#F9FAFB' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#111827' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#6B7280' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#E5E7EB' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#EF4444' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#10B981' },
    { tokenKey: 'color.warning', tokenType: 'color' as const, tokenValue: '#F59E0B' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '4px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '48px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 1px 2px rgb(0 0 0 / 0.05)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
  ],
  recipes: [
    {
      name: 'SaaS Hero',
      type: 'hero' as const,
      codeTemplate: `<section className="relative overflow-hidden bg-white py-24 sm:py-32">
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{headline}</h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">{subheadline}</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a href="{ctaLink}" className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600">{ctaText}</a>
        <a href="{secondaryLink}" className="text-sm font-semibold leading-6 text-gray-900">{secondaryText} →</a>
      </div>
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          ctaText: { type: 'string' },
          ctaLink: { type: 'string' },
          secondaryText: { type: 'string' },
          secondaryLink: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for the main landing page hero. Keep headline under 10 words. Subheadline should explain the value proposition in one sentence.',
    },
    {
      name: 'SaaS Pricing',
      type: 'pricing' as const,
      codeTemplate: `<section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8"><h2 className="text-3xl font-bold text-center text-gray-900">{title}</h2><div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">{plans}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' },
                features: { type: 'array' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Always show 3 pricing tiers. Highlight the recommended plan with a border accent.',
    },
    {
      name: 'SaaS FAQ',
      type: 'faq' as const,
      codeTemplate: `<section className="bg-gray-50 py-24"><div className="mx-auto max-w-3xl px-6"><h2 className="text-3xl font-bold text-gray-900">{title}</h2><dl className="mt-10 space-y-6">{items}</dl></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { question: { type: 'string' }, answer: { type: 'string' } },
            },
          },
        },
      },
      aiUsageRules: 'Use accordion-style FAQ. Group related questions together.',
    },
    {
      name: 'SaaS Footer',
      type: 'footer' as const,
      codeTemplate: `<footer className="bg-gray-900 text-gray-400 py-12"><div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">{columns}</div><div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">{copyright}</div></footer>`,
      jsonSchema: {
        type: 'object',
        properties: { columns: { type: 'array' }, copyright: { type: 'string' } },
      },
      aiUsageRules: 'Include company info, product links, resources, and legal links as 4 columns.',
    },
    {
      name: 'SaaS Header',
      type: 'header' as const,
      codeTemplate: `<header className="bg-white border-b border-gray-200"><nav className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16"><div className="flex items-center gap-8"><span className="font-bold text-xl">{logo}</span>{navLinks}</div><div className="flex items-center gap-4">{authButtons}</div></nav></header>`,
      jsonSchema: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          navLinks: { type: 'array' },
          authButtons: { type: 'array' },
        },
      },
      aiUsageRules: 'Keep navigation to 4-5 items max. Include sign-in and sign-up CTAs.',
    },
    {
      name: 'SaaS CTA',
      type: 'cta' as const,
      codeTemplate: `<section className="bg-blue-500 py-16"><div className="mx-auto max-w-4xl px-6 text-center"><h2 className="text-3xl font-bold text-white">{headline}</h2><p className="mt-4 text-lg text-blue-100">{description}</p><a href="{ctaLink}" className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-500 shadow-sm hover:bg-blue-50">{ctaText}</a></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          description: { type: 'string' },
          ctaText: { type: 'string' },
          ctaLink: { type: 'string' },
        },
      },
      aiUsageRules: 'Use as a bottom-of-page conversion section. Keep messaging action-oriented.',
    },
    {
      name: 'SaaS Testimonials',
      type: 'testimonial' as const,
      codeTemplate: `<section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-bold text-center text-gray-900">{title}</h2><div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">{testimonials}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          testimonials: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                quote: { type: 'string' },
                author: { type: 'string' },
                role: { type: 'string' },
                avatar: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules: 'Show 3 testimonials. Include avatar, name, role, and company.',
    },
    {
      name: 'SaaS Features',
      type: 'feature' as const,
      codeTemplate: `<section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-bold text-center text-gray-900">{title}</h2><div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">{features}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                icon: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Show 3-6 features in a grid. Each feature has an icon, title, and short description.',
    },
  ],
};
