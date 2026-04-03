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
            Choose your design system. Get a config block. Claude follows it everywhere. Zero
            install — one JSON snippet is all you need.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/studio"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Get Started
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
