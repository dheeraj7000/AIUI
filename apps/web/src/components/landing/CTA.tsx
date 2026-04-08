import Link from 'next/link';

export function CTA() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-20 sm:py-24"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start shipping{' '}
          <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
            consistent UIs
          </span>{' '}
          today
        </h2>
        <p className="mt-4 text-lg leading-8 text-zinc-400">
          Free to start, no credit card required. Connect your design system in under a minute and
          let every AI conversation follow your rules.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/quick-setup"
            className="w-full sm:w-auto rounded-lg bg-lime-500 px-6 py-3.5 text-center text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/20 transition-all hover:bg-lime-400 hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <a
            href="mailto:hello@aiui.dev"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3.5 text-center text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
          >
            Talk to Us
          </a>
        </div>
      </div>
    </section>
  );
}
