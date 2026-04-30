import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="editorial">
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--ink-muted)' }}
        >
          Error · 404
        </span>
        <h1
          className="mt-6 font-mono text-7xl font-bold leading-none"
          style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
        >
          Not found
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span>→</span> Return home
        </Link>
      </div>
    </main>
  );
}
