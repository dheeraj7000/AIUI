import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span
        className="font-mono text-xs uppercase tracking-[0.18em]"
        style={{ color: 'var(--ink-muted)' }}
      >
        Error · 404
      </span>
      <h1
        className="mt-6 font-mono text-5xl font-bold leading-none"
        style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
      >
        Not found
      </h1>
      <p className="mt-3 max-w-md text-sm" style={{ color: 'var(--ink-soft)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <span>→</span> Back to dashboard
      </Link>
    </div>
  );
}
