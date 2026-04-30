import * as React from 'react';

const LOGOS = ['Linear', 'Vercel', 'Cursor', 'Figma', 'Stripe'];

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden py-20 px-6 bg-muted">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-primary bg-background border border-border rounded-full mb-5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            New · v2 just shipped
          </span>

          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Ship beautiful UI <br />
            without the design <span className="text-primary">debt</span>.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-7">
            Acme is the design system that learns from your codebase and enforces it on every UI
            your AI writes — so the next 100 PRs don&apos;t drift from the first one.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="px-6 py-3 bg-foreground text-background text-base font-semibold rounded-md hover:opacity-90"
            >
              Start free
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 text-foreground border border-border text-base font-semibold rounded-md hover:bg-background"
            >
              <span
                aria-hidden
                className="w-5 h-5 rounded-full bg-foreground text-background text-xs flex items-center justify-center"
              >
                ▶
              </span>
              Watch demo
            </button>
          </div>

          <div className="mt-10">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            className="border-2 border-foreground rounded-md bg-background overflow-hidden"
            aria-hidden
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="w-3 h-3 rounded-full bg-warning" />
              <span className="w-3 h-3 rounded-full bg-success" />
            </div>
            <div className="p-5 grid grid-cols-3 gap-3">
              <div className="col-span-2 h-10 bg-muted rounded-sm" />
              <div className="h-10 bg-muted rounded-sm" />
              <div className="col-span-3 h-3 bg-muted rounded-sm" />
              <div className="col-span-3 h-3 bg-muted rounded-sm w-4/5" />
              <div className="col-span-3 h-3 bg-muted rounded-sm w-3/5" />
              <div className="col-span-3 h-10 bg-foreground rounded-sm mt-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
