import Link from 'next/link';

export default function AdoptPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-4">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--ink-muted)' }}
        >
          ADOPT
        </span>
      </div>

      <h1
        className="mt-6 font-mono text-4xl font-bold leading-none"
        style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
      >
        Bring an existing codebase
      </h1>

      <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Already shipped a real app? Don&rsquo;t start from scratch. The Adopt flow scans your
        existing codebase, finds the colors, spacings, radii, and fonts you keep reaching for, and
        turns them into project-scoped design tokens — so AIUI&rsquo;s validation, audit, and memory
        tools have something real to enforce against.
      </p>

      <Step
        index="01"
        title="Audit (read-only)"
        body="Scan the codebase. See what would be promoted before you commit."
        cmd="aiui audit"
        cmdNote="Add --permissive to surface review-tier candidates too."
      />

      <Step
        index="02"
        title="Adopt (interactive ingest)"
        body="Same scan, but writes the approved tokens to your project on the server. Auto-promotes anything used 5+ times; prompts for review-tier candidates."
        cmd="aiui adopt --api-key $AIUI_API_KEY --project my-app"
        cmdNote="Add -y to accept everything; --review-all to triage with a multi-select."
      />

      <Step
        index="03"
        title="Watch (continuous)"
        body="Run during development. Re-scans on file changes, surfaces new candidates as they cross the promotion threshold, never writes without your say-so."
        cmd="aiui watch"
        cmdNote="Pairs well with your AI editor — both stay in sync as you code."
      />

      <div className="mt-12 border-t pt-8" style={{ borderColor: 'var(--rule)' }}>
        <h2
          className="font-mono text-sm font-bold uppercase tracking-[0.12em]"
          style={{ color: 'var(--ink)' }}
        >
          Driving from your AI agent
        </h2>
        <p className="mt-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
          The MCP server exposes <code className="font-mono">adopt_codebase</code> — pass an array
          of detected tokens and they&rsquo;re bulk-imported in one transaction. Useful when the
          agent has read access to the user&rsquo;s files and can run the detection itself.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/api-keys"
          className="inline-flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          → Get an API key
        </Link>
        <Link
          href="/docs"
          className="text-sm font-bold underline decoration-2 underline-offset-4 transition-colors"
          style={{ color: 'var(--ink)' }}
        >
          Read the docs
        </Link>
      </div>
    </div>
  );
}

function Step({
  index,
  title,
  body,
  cmd,
  cmdNote,
}: {
  index: string;
  title: string;
  body: string;
  cmd: string;
  cmdNote: string;
}) {
  return (
    <section className="mt-10 border-t pt-6" style={{ borderColor: 'var(--rule)' }}>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--ink-muted)' }}>
          {index}
        </span>
        <h2
          className="font-mono text-sm font-extrabold uppercase tracking-[0.12em]"
          style={{ color: 'var(--accent)' }}
        >
          {title}
        </h2>
      </div>

      <p className="mt-3 text-base" style={{ color: 'var(--ink-soft)' }}>
        {body}
      </p>

      <pre
        className="mt-4 p-4 font-mono text-sm overflow-x-auto"
        style={{
          background: 'var(--paper-sunk)',
          color: 'var(--ink)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <span style={{ color: 'var(--ink-muted)' }}>$</span> {cmd}
      </pre>

      <p className="mt-2 font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
        {cmdNote}
      </p>
    </section>
  );
}
