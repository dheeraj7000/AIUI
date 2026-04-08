import Link from 'next/link';

export function CTA() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 py-20 sm:py-24"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start shipping{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            consistent UIs
          </span>{' '}
          today
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-400">
          Free to start, no credit card required. Connect your design system in under a minute and
          let every AI conversation follow your rules.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/quick-setup"
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <a
            href="mailto:hello@aiui.dev"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3.5 text-center text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:text-white"
          >
            Talk to Us
          </a>
        </div>
      </div>
    </section>
  );
}
