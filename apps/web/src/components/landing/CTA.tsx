import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-blue-600 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Start building with design control
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Set up your design profile in minutes. Free to start, no credit card required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            Create Free Account
          </Link>
          <Link href="/docs" className="text-sm font-semibold text-blue-100 hover:text-white">
            Read the docs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
