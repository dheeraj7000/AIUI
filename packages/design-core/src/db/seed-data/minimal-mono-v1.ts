export const minimalMonoV1 = {
  pack: {
    name: 'Minimal Mono',
    slug: 'minimal-mono-v1',
    category: 'minimal',
    description:
      'Ultra-minimal monochrome design system with serif typography, generous whitespace, and a single warm accent for editorial and portfolio use',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#FAFAFA' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#171717' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#525252' },
    { tokenKey: 'color.text-muted', tokenType: 'color' as const, tokenValue: '#A3A3A3' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#E5E5E5' },
    { tokenKey: 'color.border-light', tokenType: 'color' as const, tokenValue: '#F5F5F5' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#D97706' },
    { tokenKey: 'color.accent-hover', tokenType: 'color' as const, tokenValue: '#B45309' },
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#171717' },
    { tokenKey: 'radius.none', tokenType: 'radius' as const, tokenValue: '0px' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '2px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '4px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Playfair Display' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Source Sans 3' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'Source Code Pro' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '48px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '64px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
    },
  ],
  recipes: [
    {
      name: 'Editorial Hero',
      type: 'hero' as const,
      codeTemplate: `<section className="bg-[#FAFAFA] py-24 sm:py-32">
  <div className="mx-auto max-w-3xl px-6">
    <h1 className="font-serif text-5xl font-normal leading-tight tracking-tight text-[#171717] sm:text-7xl">{title}</h1>
    <div className="mt-8 h-px w-16 bg-[#171717]" />
    <p className="mt-8 text-lg leading-relaxed text-[#525252]">{description}</p>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for top-of-page editorial intros. Keep the title under 8 words. Let the serif typography and whitespace do the work -- no buttons, no images, no decoration.',
    },
    {
      name: 'Blog Post Card',
      type: 'card' as const,
      codeTemplate: `<article className="group py-8 border-b border-[#E5E5E5] last:border-b-0">
  <div className="flex items-center gap-3 text-sm text-[#A3A3A3]">
    <time>{date}</time>
    <span aria-hidden="true">--</span>
    <span>{readTime} min read</span>
  </div>
  <h3 className="mt-3 font-serif text-2xl font-normal text-[#171717] group-hover:text-[#D97706] transition-colors">{title}</h3>
  <p className="mt-2 text-base leading-relaxed text-[#525252] line-clamp-2">{excerpt}</p>
</article>`,
      jsonSchema: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          readTime: { type: 'string' },
          title: { type: 'string' },
          excerpt: { type: 'string' },
        },
      },
      aiUsageRules:
        'Stack vertically in a single column. No cards, no backgrounds, no images. The border-bottom separates entries. Title links to the full post and highlights in accent on hover.',
    },
    {
      name: 'Image Gallery',
      type: 'layout' as const,
      codeTemplate: `<section className="bg-[#FAFAFA] py-16">
  <div className="mx-auto max-w-6xl px-6">
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {items}
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                src: { type: 'string' },
                alt: { type: 'string' },
                caption: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Each item renders as: <figure className="mb-6 break-inside-avoid"><img src={src} alt={alt} className="w-full" /><figcaption className="mt-2 text-sm text-[#A3A3A3]">{caption}</figcaption></figure>. No rounded corners on images. Let the masonry layout create visual rhythm.',
    },
    {
      name: 'Author Bio',
      type: 'card' as const,
      codeTemplate: `<div className="flex items-start gap-5 py-8 border-t border-[#E5E5E5]">
  <img src="{avatar}" alt="{name}" className="h-14 w-14 rounded-full object-cover" />
  <div>
    <p className="font-serif text-lg font-normal text-[#171717]">{name}</p>
    <p className="mt-1 text-sm leading-relaxed text-[#525252]">{bio}</p>
    <div className="mt-3 flex gap-4 text-sm">
      <a href="{twitterUrl}" className="text-[#D97706] hover:text-[#B45309] transition-colors">Twitter</a>
      <a href="{websiteUrl}" className="text-[#D97706] hover:text-[#B45309] transition-colors">Website</a>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          avatar: { type: 'string' },
          name: { type: 'string' },
          bio: { type: 'string' },
          twitterUrl: { type: 'string' },
          websiteUrl: { type: 'string' },
        },
      },
      aiUsageRules:
        'Place at the end of blog posts or about pages. Social links are plain text styled with the accent color, not icons. Keep the bio to two sentences.',
    },
    {
      name: 'Quote Block',
      type: 'card' as const,
      codeTemplate: `<blockquote className="border-l-2 border-[#171717] pl-8 py-4 my-12">
  <p className="font-serif text-2xl font-normal leading-relaxed text-[#171717] sm:text-3xl">{quote}</p>
  <footer className="mt-6 text-sm text-[#A3A3A3]">
    <span>-- {attribution}</span>
  </footer>
</blockquote>`,
      jsonSchema: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          attribution: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for pull quotes within long-form content. The thin left border is the only decoration. Keep quotes to one or two sentences for maximum impact.',
    },
    {
      name: 'Minimal Navigation',
      type: 'navigation' as const,
      codeTemplate: `<nav className="mx-auto max-w-3xl px-6 py-8 flex items-center justify-between">
  <a href="/" className="font-serif text-xl text-[#171717]">{logo}</a>
  <div className="flex items-center gap-8">
    {links}
  </div>
</nav>`,
      jsonSchema: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                href: { type: 'string' },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Each link renders as: <a href={href} className="text-sm text-[#525252] hover:text-[#171717] transition-colors">{label}</a>. Active links get an underline. No background, no border, no shadow. Limit to 4-5 links. The logo is plain serif text.',
    },
    {
      name: 'Footer Minimal',
      type: 'footer' as const,
      codeTemplate: `<footer className="border-t border-[#E5E5E5] py-8">
  <div className="mx-auto max-w-3xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
    <p className="text-sm text-[#A3A3A3]">{copyright}</p>
    <div className="flex gap-6">
      <a href="{privacyUrl}" className="text-sm text-[#A3A3A3] hover:text-[#171717] transition-colors">Privacy</a>
      <a href="{termsUrl}" className="text-sm text-[#A3A3A3] hover:text-[#171717] transition-colors">Terms</a>
      <a href="{rssUrl}" className="text-sm text-[#A3A3A3] hover:text-[#171717] transition-colors">RSS</a>
    </div>
  </div>
</footer>`,
      jsonSchema: {
        type: 'object',
        properties: {
          copyright: { type: 'string' },
          privacyUrl: { type: 'string' },
          termsUrl: { type: 'string' },
          rssUrl: { type: 'string' },
        },
      },
      aiUsageRules:
        'Keep it to one line: copyright on the left, 3-4 text links on the right. No columns, no logo repeat, no newsletter form. Maximum restraint.',
    },
    {
      name: 'Tag List',
      type: 'badge' as const,
      codeTemplate: `<div className="flex flex-wrap gap-2">
  {tags}
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                href: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Each tag renders as: <a href={href} className="inline-block border border-[#E5E5E5] px-3 py-1 text-xs text-[#525252] hover:border-[#171717] hover:text-[#171717] transition-colors">{label}</a>. No fill, no rounded corners, no color. Border-only tags that darken on hover.',
    },
    {
      name: 'Newsletter Simple',
      type: 'cta' as const,
      codeTemplate: `<section className="py-16">
  <div className="mx-auto max-w-3xl px-6">
    <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="text-sm text-[#525252] sm:mr-4">{label}</label>
      <input type="email" placeholder="{placeholder}" className="flex-1 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#171717] focus:outline-none transition-colors" />
      <button type="submit" className="text-sm font-medium text-[#D97706] hover:text-[#B45309] transition-colors">{buttonText}</button>
    </form>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          placeholder: { type: 'string' },
          buttonText: { type: 'string' },
        },
      },
      aiUsageRules:
        'No card, no background, no box. Just a single line with a label, a bottom-bordered input, and a text-style submit button in the accent color. Place near the footer.',
    },
    {
      name: 'Portfolio Grid',
      type: 'layout' as const,
      codeTemplate: `<section className="bg-[#FAFAFA] py-16">
  <div className="mx-auto max-w-6xl px-6">
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
      {projects}
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          projects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                src: { type: 'string' },
                alt: { type: 'string' },
                title: { type: 'string' },
                href: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Each project renders as: <a href={href} className="group relative aspect-square overflow-hidden"><img src={src} alt={alt} className="h-full w-full object-cover transition-opacity group-hover:opacity-50" /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="font-serif text-lg text-[#171717]">{title}</span></div></a>. Tight 1px gap grid. Title only appears on hover.',
    },
  ],
};
