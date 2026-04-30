import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'System status — AIUI',
  description: 'Live health and version info for the AIUI service.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthPayload {
  status: string;
  timestamp: string;
  version: string;
}

async function fetchHealth(): Promise<{ ok: boolean; data?: HealthPayload; error?: string }> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: (await res.json()) as HealthPayload };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unreachable' };
  }
}

export default async function StatusPage() {
  const result = await fetchHealth();
  const ok = result.ok && result.data?.status === 'ok';

  return (
    <main className="editorial">
      <LandingNav />
      <section className="mx-auto max-w-[1240px] px-6 lg:px-10 py-20 lg:py-28">
        <p className="eyebrow" style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)' }}>
          System status
        </p>
        <h1
          className="mt-4 text-[2.75rem] lg:text-[3.5rem] leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          {ok ? 'All systems operational.' : 'Something is off.'}
        </h1>

        <div
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: 'var(--rule)', border: '1px solid var(--rule)' }}
        >
          <Cell label="Service">
            <Indicator ok={ok} />
            <span style={{ color: 'var(--ink)' }}>{ok ? 'Healthy' : 'Degraded'}</span>
          </Cell>
          <Cell label="Version">
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono-editorial)' }}>
              {result.data?.version ?? '—'}
            </span>
          </Cell>
          <Cell label="Checked at">
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono-editorial)' }}>
              {result.data?.timestamp ?? new Date().toISOString()}
            </span>
          </Cell>
        </div>

        {!ok && result.error && (
          <p
            className="mt-6 text-[0.875rem]"
            style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-mono-editorial)' }}
          >
            error: {result.error}
          </p>
        )}

        <p
          className="mt-12 text-[0.9375rem] max-w-[60ch]"
          style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}
        >
          This page reads <code>/api/health</code> on every request. For raw JSON, hit the endpoint
          directly.
        </p>
      </section>
      <Footer />
    </main>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-8 flex flex-col gap-3" style={{ background: 'var(--paper)' }}>
      <span
        className="text-[0.6875rem] uppercase tracking-[0.12em]"
        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono-editorial)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2 text-[0.9375rem]">{children}</div>
    </div>
  );
}

function Indicator({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: ok ? 'oklch(60% 0.15 145)' : 'var(--accent)' }}
    />
  );
}
