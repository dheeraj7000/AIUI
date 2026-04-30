import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Terms — AIUI',
  description: 'Terms of service for using AIUI.',
};

export default function TermsPage() {
  return (
    <main className="editorial">
      <LandingNav />
      <article className="mx-auto max-w-[760px] px-6 lg:px-10 py-20 lg:py-28">
        <p className="eyebrow" style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)' }}>
          Legal
        </p>
        <h1
          className="mt-4 text-[2.75rem] lg:text-[3.5rem] leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          Terms of service.
        </h1>
        <p className="mt-3 text-[0.875rem]" style={{ color: 'var(--ink-muted)' }}>
          Last updated: April 26, 2026
        </p>

        <Section title="Beta">
          <p>
            AIUI is in public beta. Features may change, break, or disappear without notice.
            Don&apos;t depend on it for production-critical workflows yet.
          </p>
        </Section>

        <Section title="Your content">
          <p>
            You own everything you create in AIUI — your style packs, tokens, components, and
            project data. We do not claim any rights to it.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don&apos;t use AIUI to abuse our infrastructure, attempt to break the service for other
            users, or violate the law. Standard stuff.
          </p>
        </Section>

        <Section title="No warranty">
          <p>
            The service is provided &quot;as is&quot; without warranty of any kind. We are not
            liable for damages arising from use of the service.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms as the product evolves. Material changes will be announced on
            this page.
          </p>
        </Section>
      </article>
      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2
        className="text-[1.25rem]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
      >
        {title}
      </h2>
      <div className="mt-3 text-[0.9375rem]" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}
