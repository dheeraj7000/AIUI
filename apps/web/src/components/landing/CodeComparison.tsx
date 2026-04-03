import { X, Check } from 'lucide-react';

const withoutAiui = `// Prompt: "Build me a settings page"

<div style={{ padding: 20 }}>
  <h1 style={{ fontSize: 24, color: "navy" }}>
    Settings
  </h1>
  <button style={{
    background: "cornflowerblue",
    padding: "8px 16px",
    borderRadius: 4,
  }}>
    Save Changes
  </button>
</div>`;

const withAiui = `// Prompt: "Build me a settings page"

<div className="p-6 space-y-6">
  <h1 className="text-heading-lg font-semibold
    text-gray-900">
    Settings
  </h1>
  <Button
    variant="primary"
    size="md"
    className="bg-primary-600 rounded-radius-lg
      shadow-shadow-sm"
  >
    Save Changes
  </Button>
</div>`;

export function CodeComparison() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            The Difference
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Design consistency, automatically
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Without AIUI, Claude invents styles on the fly. With AIUI, every component follows your
            exact design system.
          </p>
        </div>

        {/* Comparison blocks */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Without AIUI */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-red-200 bg-red-100/60 px-5 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <X className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-red-800">Without AIUI</span>
            </div>
            <div className="p-5">
              <p className="mb-3 text-sm text-red-700">
                Inconsistent styles, inline CSS, arbitrary colors, no design tokens.
              </p>
              <div className="rounded-lg bg-gray-950 p-4 overflow-x-auto">
                <pre className="text-xs leading-relaxed font-mono text-gray-300">{withoutAiui}</pre>
              </div>
            </div>
          </div>

          {/* With AIUI */}
          <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-green-200 bg-green-100/60 px-5 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-800">With AIUI</span>
            </div>
            <div className="p-5">
              <p className="mb-3 text-sm text-green-700">
                Your exact tokens, approved components, consistent output every time.
              </p>
              <div className="rounded-lg bg-gray-950 p-4 overflow-x-auto">
                <pre className="text-xs leading-relaxed font-mono text-gray-300">{withAiui}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
