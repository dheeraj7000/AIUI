import Link from 'next/link';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Section A: Beta Access */}
      <div id="beta" className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Early Access Beta
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">
            AIUI is in active development. Join the beta to shape the future of AI-driven design
            systems. Free during beta — no credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-block rounded-lg bg-lime-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/20 transition-all hover:bg-lime-400 hover:shadow-xl"
            >
              Join the Beta
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Currently supporting Claude Code, Cursor, Windsurf, and VS Code
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-zinc-800" />
      </div>

      {/* Section B: Feedback */}
      <div id="feedback" className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Help Us Build Better
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">
            We ship based on what you tell us. Found a bug? Have a feature idea? Your feedback
            directly shapes the roadmap.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Card 1: Report a Bug */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
              <h3 className="text-lg font-semibold text-white">Report a Bug</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Something broken or not working as expected? Let us know and we will fix it fast.
              </p>
              <a
                href="mailto:bugs@aiui.store"
                className="mt-4 inline-block text-sm font-medium text-lime-500 transition-colors hover:text-lime-400"
              >
                bugs@aiui.store
              </a>
            </div>

            {/* Card 2: Request a Feature */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
              <h3 className="text-lg font-semibold text-white">Request a Feature</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Have an idea that would make AIUI better? We prioritize features based on user
                requests.
              </p>
              <a
                href="mailto:features@aiui.store"
                className="mt-4 inline-block text-sm font-medium text-lime-500 transition-colors hover:text-lime-400"
              >
                features@aiui.store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-zinc-800" />
      </div>

      {/* Section C: Contact */}
      <div id="contact" className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get in Touch</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-zinc-500">Email</p>
              <a
                href="mailto:hello@aiui.store"
                className="mt-1 block text-lg font-medium text-white transition-colors hover:text-lime-400"
              >
                hello@aiui.store
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Twitter / X</p>
              <p className="mt-1 text-lg font-medium text-white">@aiikistore</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Discord</p>
              <p className="mt-1 text-lg font-medium text-white">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
