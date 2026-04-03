import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Control how AI builds your UI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose styles, components, and tokens from a visual console. Claude Code uses them
            automatically when generating your frontend.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Start for Free
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              See how it works &darr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
