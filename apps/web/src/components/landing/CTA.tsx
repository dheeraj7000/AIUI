'use client';

import Link from 'next/link';
import { ArrowRight, Bug, Lightbulb, Mail, MessageCircle } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerChild } from './motion';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 noise-overlay">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-aurora" />

      {/* Section A: Beta Access */}
      <div id="beta" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="relative inline-block">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Early Access{' '}
                <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">
                  Beta
                </span>
              </h2>
              <div className="absolute -inset-x-8 -inset-y-4 -z-10 rounded-3xl bg-gradient-to-r from-lime-500/5 to-cyan-500/5 blur-xl" />
            </div>

            <p className="mt-6 text-lg leading-8 text-zinc-400">
              AIUI is in active development. Join the beta to shape the future of AI-driven design
              systems. Free during beta — no credit card required.
            </p>

            <div className="mt-10">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-8 py-4 text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/30 hover:-translate-y-0.5"
              >
                Join the Beta
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="mt-5 text-sm text-zinc-500">
              Currently supporting Claude Code, Cursor, Windsurf, and VS Code
            </p>
          </FadeUp>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="section-divider" />
      </div>

      {/* Section B: Feedback */}
      <div id="feedback" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Help Us Build Better
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              We ship based on what you tell us. Found a bug? Have a feature idea? Your feedback
              directly shapes the roadmap.
            </p>
          </FadeUp>

          <StaggerContainer className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Card 1: Report a Bug */}
            <StaggerChild>
              <div className="group h-full rounded-2xl glass-card glass-card-hover p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/10">
                  <Bug className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Report a Bug</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Something broken or not working as expected? Let us know and we will fix it fast.
                </p>
                <a
                  href="mailto:bugs@aiui.store"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-400 transition-colors hover:text-lime-300"
                >
                  bugs@aiui.store
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </StaggerChild>

            {/* Card 2: Request a Feature */}
            <StaggerChild>
              <div className="group h-full rounded-2xl glass-card glass-card-hover p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/10">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Request a Feature</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Have an idea that would make AIUI better? We prioritize features based on user
                  requests.
                </p>
                <a
                  href="mailto:features@aiui.store"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-400 transition-colors hover:text-lime-300"
                >
                  features@aiui.store
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </StaggerChild>
          </StaggerContainer>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="section-divider" />
      </div>

      {/* Section C: Contact */}
      <div id="contact" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get in Touch
            </h2>
          </FadeUp>

          <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StaggerChild>
              <div className="rounded-2xl glass-card p-6 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Mail className="h-5 w-5 text-lime-400" />
                </div>
                <p className="text-sm font-medium text-zinc-500">Email</p>
                <a
                  href="mailto:hello@aiui.store"
                  className="mt-1 block text-base font-medium text-white transition-colors hover:text-lime-400"
                >
                  hello@aiui.store
                </a>
              </div>
            </StaggerChild>
            <StaggerChild>
              <div className="rounded-2xl glass-card p-6 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <svg className="h-5 w-5 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-500">Twitter / X</p>
                <p className="mt-1 text-base font-medium text-white">@aiikistore</p>
              </div>
            </StaggerChild>
            <StaggerChild>
              <div className="rounded-2xl glass-card p-6 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <MessageCircle className="h-5 w-5 text-lime-400" />
                </div>
                <p className="text-sm font-medium text-zinc-500">Discord</p>
                <p className="mt-1 text-base font-medium text-white">Coming Soon</p>
              </div>
            </StaggerChild>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
