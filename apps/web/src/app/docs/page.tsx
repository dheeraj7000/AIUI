import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Documentation - AIUI',
  description:
    'Learn how AIUI solves design inconsistency in AI-generated code. Design tokens, component recipes, and MCP integration for Claude Code, Cursor, Windsurf, and VS Code.',
};

const sidebarSections = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'how-aiui-works', label: 'How AIUI Works' },
  { id: 'key-features', label: 'Key Features' },
  { id: 'supported-tools', label: 'Supported Tools' },
  { id: 'getting-started', label: 'Getting Started' },
];

export default function DocsPage() {
  return (
    <>
      <LandingNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8 lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[260px_1fr] xl:gap-16">
          {/* Sidebar navigation */}
          <aside className="hidden md:block">
            <nav className="sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                On this page
              </h2>
              <ul className="space-y-1">
                {sidebarSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-gray-200 pt-6">
                <Link
                  href="/quick-setup"
                  className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            {/* Page header */}
            <div className="mb-12">
              <p className="text-sm font-semibold text-blue-600 mb-2">Documentation</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Why AIUI exists
              </h1>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl">
                AIUI is the design control layer for AI coding assistants. It ensures every
                AI-generated component matches your brand, every time.
              </p>
            </div>

            {/* The Problem */}
            <section id="the-problem" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">The Problem</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  AI coding assistants are transforming how software gets built. Tools like Claude
                  Code, Cursor, and Copilot can generate entire UI components in seconds. But there
                  is a fundamental problem: they have no awareness of your design system.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Every time an AI generates a component, it makes its own decisions about colors,
                  typography, spacing, and structure. The result is a patchwork of inconsistent
                  styles that look nothing like your brand.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-6">
                <ProblemCard
                  title="Inconsistent output"
                  description="AI tools pick different colors, fonts, and spacing every time they generate a component. A button in one prompt looks completely different from a button in the next."
                />
                <ProblemCard
                  title="No design system enforcement"
                  description="Designers create design systems with specific tokens and rules, but AI tools have no way to access or follow them during code generation."
                />
                <ProblemCard
                  title="Manual cleanup wastes time"
                  description="Teams spend hours adjusting AI-generated code to match their brand guidelines. The speed advantage of AI disappears in rework."
                />
                <ProblemCard
                  title="Brand drift at scale"
                  description="As more developers use AI to ship faster, the UI drifts further from the original design system. Consistency becomes impossible to maintain."
                />
              </div>
            </section>

            {/* How AIUI Works */}
            <section id="how-aiui-works" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How AIUI Works</h2>
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-600 leading-relaxed mb-4">
                  AIUI sits between your design system and your AI coding tools. It uses the Model
                  Context Protocol (MCP) to feed your design tokens, component patterns, and brand
                  rules directly into the AI assistant&apos;s context window, so every generated
                  component is on-brand from the start.
                </p>
              </div>

              <div className="space-y-6">
                <StepCard
                  number="1"
                  title="Define your design tokens"
                  description="Set your colors, typography scale, spacing units, shadows, and border radii in the AIUI dashboard. Import from Figma, Tailwind configs, or start with a pre-built style pack."
                />
                <StepCard
                  number="2"
                  title="Create component recipes"
                  description="Define approved component patterns with specific token usage. A 'primary button' recipe specifies exactly which background color, text size, padding, and border radius to use."
                />
                <StepCard
                  number="3"
                  title="Connect via MCP"
                  description="Add one configuration block to your AI tool. AIUI serves your design system over the Model Context Protocol, so the AI reads your tokens before generating any code."
                />
                <StepCard
                  number="4"
                  title="Generate consistent UI"
                  description="When your AI assistant builds a component, it pulls your tokens and recipes from AIUI automatically. The output matches your design system without any manual correction."
                />
              </div>
            </section>

            {/* Key Features */}
            <section id="key-features" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>

              <div className="space-y-8">
                <FeatureBlock
                  title="Design Token Management"
                  description="Centralize all your design primitives in one place. Define colors, typography, spacing, shadows, and border tokens with precise values. Changes propagate instantly to every connected AI tool."
                />
                <FeatureBlock
                  title="Component Recipes"
                  description="Go beyond tokens with full component patterns. Define how a card, modal, or navigation bar should be structured, including which tokens to apply to each element. AI assistants follow these recipes exactly."
                />
                <FeatureBlock
                  title="Style Packs"
                  description="Start fast with pre-built design systems. Style packs like 'SaaS Clean' and 'Dashboard Pro' provide a complete set of tokens and recipes you can activate instantly or customize to fit your brand."
                />
                <FeatureBlock
                  title="Design Validation"
                  description="AIUI validates AI-generated code against your design rules. Catch token mismatches, unapproved colors, or spacing violations before they ship to production."
                />
                <FeatureBlock
                  title="Multi-IDE Support"
                  description="Works with every major AI coding environment through MCP. One design system definition powers consistent output across Claude Code, Cursor, Windsurf, and VS Code with Copilot."
                />
                <FeatureBlock
                  title="Visual Studio"
                  description="A visual editor for designing and previewing your tokens in real time. See how your color palette, typography, and spacing look together before connecting them to your AI tools."
                />
              </div>
            </section>

            {/* Supported Tools */}
            <section id="supported-tools" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Tools</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                AIUI connects to AI coding assistants through the Model Context Protocol. Any tool
                that supports MCP can use AIUI as a design context source.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <ToolCard
                  name="Claude Code"
                  description="Anthropic's CLI for Claude. Connect with a single terminal command. Full MCP support with streaming."
                  setup="Terminal command"
                />
                <ToolCard
                  name="Cursor"
                  description="AI-first code editor. Add AIUI to your .cursor/mcp.json configuration file for project-level design enforcement."
                  setup=".cursor/mcp.json"
                />
                <ToolCard
                  name="Windsurf"
                  description="Codeium's AI IDE. Configure via the MCP settings panel. Design tokens load automatically in every Cascade session."
                  setup="MCP settings"
                />
                <ToolCard
                  name="VS Code + Copilot"
                  description="GitHub Copilot in VS Code. Add AIUI to your VS Code settings.json under mcp.servers for Copilot Chat integration."
                  setup="settings.json"
                />
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-600 leading-relaxed mb-4">
                  You can connect AIUI to your AI coding assistant in under a minute. The quick
                  setup flow creates an account, generates an API key, and gives you the exact
                  configuration to paste into your tool.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-violet-50/50 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
                <p className="text-gray-600 mb-6">
                  Create an account and connect your first AI tool. The setup takes less than 60
                  seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/quick-setup"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                  >
                    Quick Setup
                  </Link>
                  <Link
                    href="/style-packs"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Browse Style Packs
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-blue-600 pl-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ToolCard({
  name,
  description,
  setup,
}: {
  name: string;
  description: string;
  setup: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {setup}
        </span>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
