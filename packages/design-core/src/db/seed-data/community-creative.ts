/**
 * Community Creative — UIverse-inspired components and creative patterns.
 * Curated from open-source community contributions (UIverse.io, Aceternity, etc.)
 * All components use Tailwind CSS, no external dependencies.
 */
export const communityCreative = {
  pack: {
    name: 'Community Creative',
    slug: 'community-creative-v1',
    category: 'creative',
    description:
      'Eye-catching community-sourced components — glassmorphism cards, neon buttons, gradient heroes, and creative UI patterns inspired by UIverse.io and the open-source community.',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#6366F1' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#4F46E5' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#EC4899' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#14B8A6' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#0A0A0A' },
    {
      tokenKey: 'color.surface',
      tokenType: 'color' as const,
      tokenValue: 'rgba(255, 255, 255, 0.05)',
    },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#F9FAFB' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#9CA3AF' },
    {
      tokenKey: 'color.border',
      tokenType: 'color' as const,
      tokenValue: 'rgba(255, 255, 255, 0.1)',
    },
    { tokenKey: 'color.neon-blue', tokenType: 'color' as const, tokenValue: '#00D4FF' },
    { tokenKey: 'color.neon-purple', tokenType: 'color' as const, tokenValue: '#A855F7' },
    { tokenKey: 'color.neon-pink', tokenType: 'color' as const, tokenValue: '#EC4899' },
    {
      tokenKey: 'color.glass',
      tokenType: 'color' as const,
      tokenValue: 'rgba(255, 255, 255, 0.08)',
    },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.xl', tokenType: 'radius' as const, tokenValue: '24px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'Space Grotesk, sans-serif',
    },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter, sans-serif' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono, monospace' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '64px' },
    {
      tokenKey: 'shadow.neon',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
    },
    {
      tokenKey: 'shadow.glass',
      tokenType: 'shadow' as const,
      tokenValue: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    {
      tokenKey: 'shadow.elevated',
      tokenType: 'shadow' as const,
      tokenValue: '0 20px 60px rgba(0, 0, 0, 0.5)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 2px 8px rgba(0, 0, 0, 0.3)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 20px 60px rgba(0, 0, 0, 0.5)',
    },
  ],
  recipes: [
    {
      name: 'Glassmorphism Card',
      type: 'card' as const,
      codeTemplate: `interface GlassCardProps extends React.ComponentProps<"div"> {
  title: string
  description: string
  icon?: React.ReactNode
}

export function GlassCard({ title, description, icon, className, children, ...props }: GlassCardProps) {
  return (
    <div className={\`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] \${className ?? ""}\`} {...props}>
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:from-indigo-500/30 group-hover:to-purple-500/30" />
      <div className="relative z-10">
        {icon && <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3">{icon}</div>}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>
        {children}
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use GlassCard for feature cards on dark backgrounds. The glassmorphism effect (backdrop-blur + semi-transparent bg) works best over gradient or image backgrounds. Keep content concise. The hover effect includes a glowing orb animation.',
    },
    {
      name: 'Neon Button',
      type: 'cta' as const,
      codeTemplate: `interface NeonButtonProps extends React.ComponentProps<"button"> {
  color?: "blue" | "purple" | "pink" | "green"
}

const neonColors = {
  blue: { bg: "bg-cyan-500", shadow: "shadow-[0_0_20px_rgba(0,212,255,0.5)]", hoverShadow: "hover:shadow-[0_0_30px_rgba(0,212,255,0.7),0_0_60px_rgba(0,212,255,0.3)]", ring: "ring-cyan-400" },
  purple: { bg: "bg-violet-500", shadow: "shadow-[0_0_20px_rgba(139,92,246,0.5)]", hoverShadow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.7),0_0_60px_rgba(139,92,246,0.3)]", ring: "ring-violet-400" },
  pink: { bg: "bg-pink-500", shadow: "shadow-[0_0_20px_rgba(236,72,153,0.5)]", hoverShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.7),0_0_60px_rgba(236,72,153,0.3)]", ring: "ring-pink-400" },
  green: { bg: "bg-emerald-500", shadow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]", hoverShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.7),0_0_60px_rgba(16,185,129,0.3)]", ring: "ring-emerald-400" },
}

export function NeonButton({ color = "blue", className, children, ...props }: NeonButtonProps) {
  const c = neonColors[color]
  return (
    <button className={\`relative inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-300 \${c.bg} \${c.shadow} \${c.hoverShadow} hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black \${c.ring} \${className ?? ""}\`} {...props}>
      {children}
    </button>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          color: { type: 'string', enum: ['blue', 'purple', 'pink', 'green'] },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use NeonButton for high-impact CTAs on dark backgrounds. The neon glow effect is most visible on dark surfaces. Choose color to match your brand. Limit to 1-2 per section.',
    },
    {
      name: 'Gradient Hero Section',
      type: 'hero' as const,
      codeTemplate: `interface GradientHeroProps {
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
  secondaryText?: string
  secondaryLink?: string
}

export function GradientHero({ headline, subheadline, ctaText, ctaLink, secondaryText, secondaryLink }: GradientHeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-600/30 blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-600/20 blur-[128px]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
          ✨ Introducing something new
        </div>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">{headline}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">{subheadline}</p>
        <div className="mt-10 flex items-center gap-4">
          <a href={ctaLink} className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            {ctaText}
          </a>
          {secondaryText && secondaryLink && (
            <a href={secondaryLink} className="inline-flex items-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/5">
              {secondaryText} →
            </a>
          )}
        </div>
      </div>
    </section>
  )
}`,
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
        'Use GradientHero for landing page hero sections with dark, gradient-rich aesthetics. The multi-layer blur background creates depth. Keep headline under 8 words. Subheadline should be 1-2 sentences explaining the value prop.',
    },
    {
      name: 'Animated Testimonial Card',
      type: 'testimonial' as const,
      codeTemplate: `interface TestimonialCardProps extends React.ComponentProps<"div"> {
  quote: string
  author: string
  role: string
  avatarUrl?: string
  rating?: number
}

export function TestimonialCard({ quote, author, role, avatarUrl, rating = 5, className, ...props }: TestimonialCardProps) {
  return (
    <div className={\`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] \${className ?? ""}\`} {...props}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 flex gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ))}
        </div>
        <blockquote className="text-sm leading-relaxed text-gray-300">"{quote}"</blockquote>
        <div className="mt-4 flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={author} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
              {author.split(" ").map(n => n[0]).join("")}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          author: { type: 'string' },
          role: { type: 'string' },
          avatarUrl: { type: 'string' },
          rating: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use TestimonialCard for social proof sections. Display in a grid (2-3 columns) or marquee. Include star ratings for credibility. Avatar fallback shows initials with a gradient. Keep quotes under 3 sentences.',
    },
    {
      name: 'Floating Header',
      type: 'header' as const,
      codeTemplate: `interface FloatingHeaderProps {
  logo: string
  navLinks: Array<{ label: string; href: string }>
  ctaText?: string
  ctaLink?: string
}

export function FloatingHeader({ logo, navLinks, ctaText, ctaLink }: FloatingHeaderProps) {
  return (
    <header className="fixed top-4 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4">
      <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <a href="/" className="text-lg font-bold text-white">{logo}</a>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">{link.label}</a>
          ))}
        </div>
        {ctaText && ctaLink && (
          <a href={ctaLink} className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-200">{ctaText}</a>
        )}
      </nav>
    </header>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          navLinks: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, href: { type: 'string' } },
            },
          },
          ctaText: { type: 'string' },
          ctaLink: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use FloatingHeader for modern landing pages. The header floats above content with glassmorphism styling. Keep navigation to 4-5 items max. The CTA button should be the primary action (e.g., "Get Started").',
    },
    {
      name: 'Creative Footer',
      type: 'footer' as const,
      codeTemplate: `interface FooterColumn { title: string; links: Array<{ label: string; href: string }> }

interface CreativeFooterProps {
  logo: string
  tagline: string
  columns: FooterColumn[]
  copyright: string
  socials?: Array<{ label: string; href: string; icon: React.ReactNode }>
}

export function CreativeFooter({ logo, tagline, columns, copyright, socials }: CreativeFooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black">
      <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/10 blur-[128px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white">{logo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{tagline}</p>
            {socials && (
              <div className="mt-4 flex gap-3">
                {socials.map((s) => (
                  <a key={s.href} href={s.href} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all hover:border-white/20 hover:text-white" aria-label={s.label}>{s.icon}</a>
                ))}
              </div>
            )}
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}><a href={link.href} className="text-sm text-gray-500 transition-colors hover:text-white">{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-gray-600">{copyright}</div>
      </div>
    </footer>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          logo: { type: 'string' },
          tagline: { type: 'string' },
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, links: { type: 'array' } },
            },
          },
          copyright: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use CreativeFooter for dark-themed landing pages. Include 2-3 link columns (Product, Company, Legal). Keep tagline to 1-2 sentences. Add social icons for brand presence. The gradient glow at the bottom adds visual interest.',
    },
    {
      name: 'Pricing Table',
      type: 'pricing' as const,
      codeTemplate: `interface PricingPlan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  ctaText: string
  ctaLink: string
  highlighted?: boolean
}

interface PricingTableProps {
  title: string
  subtitle: string
  plans: PricingPlan[]
}

export function PricingTable({ title, subtitle, plans }: PricingTableProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-gray-400">{subtitle}</p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={\`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 \${plan.highlighted ? "border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-[0_0_40px_rgba(99,102,241,0.15)]" : "border-white/10 bg-white/5 hover:border-white/20"}\`}>
              {plan.highlighted && <div className="absolute top-0 right-0 rounded-bl-xl bg-indigo-500 px-3 py-1 text-xs font-bold text-white">Popular</div>}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={plan.ctaLink} className={\`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all \${plan.highlighted ? "bg-indigo-500 text-white hover:bg-indigo-600" : "border border-white/20 text-white hover:bg-white/5"}\`}>
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' },
                period: { type: 'string' },
                description: { type: 'string' },
                features: { type: 'array', items: { type: 'string' } },
                ctaText: { type: 'string' },
                ctaLink: { type: 'string' },
                highlighted: { type: 'boolean' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use PricingTable with 3 plans (free, pro, enterprise). Mark the recommended plan with highlighted=true. List 4-6 features per plan in ascending order. Price format: "$X" for one-time, "$X/mo" for recurring.',
    },
    {
      name: 'Contact Form',
      type: 'contact' as const,
      codeTemplate: `interface ContactFormProps {
  title: string
  subtitle: string
  submitText?: string
}

export function ContactForm({ title, subtitle, submitText = "Send Message" }: ContactFormProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="mt-3 text-gray-400">{subtitle}</p>
        </div>
        <form className="mt-12 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input type="text" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input type="text" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea rows={5} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none" placeholder="Tell us about your project..." />
          </div>
          <button type="submit" className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98]">
            {submitText}
          </button>
        </form>
      </div>
    </section>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          submitText: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use ContactForm for contact/inquiry pages. Fields: first name, last name, email, message. The dark glassmorphic input style matches the creative theme. Add form validation and submission handling as needed.',
    },
    {
      name: 'Feature Showcase',
      type: 'feature' as const,
      codeTemplate: `interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeatureShowcaseProps {
  title: string
  subtitle: string
  features: Feature[]
}

export function FeatureShowcase({ title, subtitle, features }: FeatureShowcaseProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-gray-400">{subtitle}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 transition-all duration-500 group-hover:from-indigo-500/5 group-hover:to-purple-500/5" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-400 ring-1 ring-indigo-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
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
        'Use FeatureShowcase for product feature grids. Display 3 or 6 features for balanced layouts. Each feature needs an icon (use Lucide icons), title (3-4 words), and description (1-2 sentences). The hover effect adds a subtle gradient overlay.',
    },
    {
      name: 'Social Proof Bar',
      type: 'testimonial' as const,
      codeTemplate: `interface SocialProofBarProps {
  label: string
  logos: Array<{ name: string; src: string }>
  metric?: { value: string; description: string }
}

export function SocialProofBar({ label, logos, metric }: SocialProofBarProps) {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-gray-500">{label}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <img key={logo.name} src={logo.src} alt={logo.name} className="h-8 object-contain opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0" />
          ))}
        </div>
        {metric && (
          <div className="mt-8 text-center">
            <span className="text-3xl font-bold text-white">{metric.value}</span>
            <span className="ml-2 text-sm text-gray-500">{metric.description}</span>
          </div>
        )}
      </div>
    </section>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          logos: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, src: { type: 'string' } },
            },
          },
          metric: {
            type: 'object',
            properties: { value: { type: 'string' }, description: { type: 'string' } },
          },
        },
      },
      aiUsageRules:
        'Use SocialProofBar between hero and features sections. Show 4-6 company logos. Logos are grayscale by default, colored on hover. Add an optional metric for extra credibility (e.g., "10,000+ teams use our platform").',
    },
  ],
};
