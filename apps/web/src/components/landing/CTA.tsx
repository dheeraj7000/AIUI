'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink } from 'lucide-react';

const configSnippet = `{
  "mcpServers": {
    "aiui": {
      "type": "streamable-http",
      "url": "https://mcp.aiui.dev/mcp",
      "headers": {
        "Authorization": "Bearer aiui_k_..."
      }
    }
  }
}`;

export function CTA() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(configSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start building with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                design control
              </span>
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              Add one config block. Claude follows your design system in every conversation. Free to
              start, no credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/quick-setup"
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <a
                href="https://gitlab.com/dkumar70/AIUI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3.5 text-center text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitLab
              </a>
            </div>
          </div>

          {/* Right: config block */}
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="ml-2 text-xs text-gray-500 font-mono">.mcp.json</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                  aria-label="Copy config"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-sm leading-relaxed font-mono">
                  <code>
                    <span className="text-gray-500">{'{'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'  '}</span>
                    <span className="text-blue-400">{'"mcpServers"'}</span>
                    <span className="text-gray-500">: {'{'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'    '}</span>
                    <span className="text-green-400">{'"aiui"'}</span>
                    <span className="text-gray-500">: {'{'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'      '}</span>
                    <span className="text-blue-400">{'"type"'}</span>
                    <span className="text-gray-500">: </span>
                    <span className="text-amber-300">{'"streamable-http"'}</span>
                    <span className="text-gray-500">,</span>
                    {'\n'}
                    <span className="text-gray-500">{'      '}</span>
                    <span className="text-blue-400">{'"url"'}</span>
                    <span className="text-gray-500">: </span>
                    <span className="text-amber-300">{'"https://mcp.aiui.dev/mcp"'}</span>
                    <span className="text-gray-500">,</span>
                    {'\n'}
                    <span className="text-gray-500">{'      '}</span>
                    <span className="text-blue-400">{'"headers"'}</span>
                    <span className="text-gray-500">: {'{'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'        '}</span>
                    <span className="text-blue-400">{'"Authorization"'}</span>
                    <span className="text-gray-500">: </span>
                    <span className="text-amber-300">{'"Bearer aiui_k_..."'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'      }'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'    }'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'  }'}</span>
                    {'\n'}
                    <span className="text-gray-500">{'}'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
