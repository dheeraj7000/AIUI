import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-blue-600 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          One config block. Design-consistent UI.
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Pick a style pack, generate an API key, and add this to your project:
        </p>
        <div className="mx-auto mt-6 max-w-lg rounded-lg bg-blue-700/50 p-4 text-left font-mono text-sm text-blue-100">
          <pre>{`{
  "mcpServers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://mcp.aiui.dev/mcp",
      "headers": { "Authorization": "Bearer aiui_k_..." }
    }
  }
}`}</pre>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/studio"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            Get Started Free
          </Link>
          <a href="#how-it-works" className="text-sm font-semibold text-blue-100 hover:text-white">
            How it works &darr;
          </a>
        </div>
      </div>
    </section>
  );
}
