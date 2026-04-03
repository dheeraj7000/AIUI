export const startupBoldV1 = {
  pack: {
    name: 'Startup Bold',
    slug: 'startup-bold-v1',
    category: 'startup',
    description:
      'Vibrant, bold design system for startups with gradient accents and modern aesthetics',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#6D28D9' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#EC4899' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#F59E0B' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#0F0F23' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#1A1A3E' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#A1A1C7' },
    { tokenKey: 'color.gradient-start', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.gradient-end', tokenType: 'color' as const, tokenValue: '#EC4899' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#34D399' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#F87171' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Cal Sans' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'Fira Code' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '48px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '64px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 2px 8px rgb(124 58 237 / 0.15)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 16px rgb(124 58 237 / 0.2)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 8px 32px rgb(124 58 237 / 0.3)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 2px 8px rgb(0 0 0 / 0.3)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 4px 16px rgb(0 0 0 / 0.4)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 8px 32px rgb(0 0 0 / 0.5)',
    },
  ],
  recipes: [
    {
      name: 'Gradient Hero',
      type: 'hero' as const,
      codeTemplate: `<section className="relative overflow-hidden bg-[#0F0F23] py-32"><div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" /><div className="relative mx-auto max-w-5xl px-6 text-center"><h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{headline}</h1><p className="mt-8 text-xl text-gray-300">{subheadline}</p><div className="mt-12 flex justify-center gap-4"><a href="{ctaLink}" className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">{ctaText}</a></div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          ctaText: { type: 'string' },
          ctaLink: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use gradient text for headlines. Keep dark background. Bold and impactful messaging.',
    },
    {
      name: 'Feature Grid Bold',
      type: 'feature' as const,
      codeTemplate: `<section className="bg-[#0F0F23] py-24"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-bold text-white text-center">{title}</h2><div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">{features}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: { title: { type: 'string' }, features: { type: 'array' } },
      },
      aiUsageRules:
        'Each feature card gets a subtle gradient border and glow effect. Use emoji or icons.',
    },
    {
      name: 'Social Proof Strip',
      type: 'testimonial' as const,
      codeTemplate: `<section className="bg-[#1A1A3E] py-16"><div className="mx-auto max-w-7xl px-6"><p className="text-center text-sm font-medium uppercase tracking-wider text-gray-400">{label}</p><div className="mt-8 flex flex-wrap items-center justify-center gap-12">{logos}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: { label: { type: 'string' }, logos: { type: 'array' } },
      },
      aiUsageRules: 'Show company logos in grayscale. Use "Trusted by" or "Backed by" as label.',
    },
    {
      name: 'Bold Pricing',
      type: 'pricing' as const,
      codeTemplate: `<section className="bg-[#0F0F23] py-24"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-bold text-white text-center">{title}</h2><div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">{plans}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: { title: { type: 'string' }, plans: { type: 'array' } },
      },
      aiUsageRules:
        'Highlight featured plan with gradient border. Use dark card backgrounds with light text.',
    },
    {
      name: 'App Screenshot',
      type: 'feature' as const,
      codeTemplate: `<section className="bg-[#0F0F23] py-24"><div className="mx-auto max-w-6xl px-6"><div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center"><div><h2 className="text-3xl font-bold text-white">{title}</h2><p className="mt-4 text-lg text-gray-300">{description}</p><ul className="mt-8 space-y-3">{bulletPoints}</ul></div><div className="relative"><div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl" /><img src="{screenshot}" alt="{alt}" className="relative rounded-xl shadow-2xl" /></div></div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          bulletPoints: { type: 'array' },
          screenshot: { type: 'string' },
          alt: { type: 'string' },
        },
      },
      aiUsageRules:
        'Show product screenshot with glow effect. Pair with feature bullets on the left.',
    },
    {
      name: 'Team Grid',
      type: 'card' as const,
      codeTemplate: `<section className="bg-[#1A1A3E] py-24"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-bold text-white text-center">{title}</h2><div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">{members}</div></div></section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                avatar: { type: 'string' },
                social: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules: 'Circular avatars with hover effect. Show name, role, and social link.',
    },
  ],
};
