'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { Footer } from '@/components/landing/Footer';

type Step = 'email' | 'loading' | 'done';

interface SetupResult {
  apiKey: string;
  userId: string;
  orgId: string;
  mcpUrl: string;
}

export default function QuickSetupPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SetupResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const mcpUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/mcp` : 'https://aiui.store/mcp';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('loading');

    try {
      // 1. Sign up (or sign in if account exists)
      let authRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: email.split('@')[0] }),
      });

      if (authRes.status === 409) {
        // Account exists — sign in instead
        authRes = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!authRes.ok) {
        const data = await authRes.json();
        throw new Error(data.error || 'Authentication failed');
      }

      const authData = await authRes.json();
      const token = authData.accessToken;

      // 2. Set up org
      const setupRes = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email: authData.user.email,
        }),
      });

      const setupData = await setupRes.json();
      const orgId = setupData.orgId;

      // 3. Generate API key
      const keyRes = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'quick-setup',
          organizationId: orgId,
        }),
      });

      if (!keyRes.ok) {
        const data = await keyRes.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const keyData = await keyRes.json();

      setResult({
        apiKey: keyData.rawKey,
        userId: authData.user.id,
        orgId,
        mcpUrl,
      });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('email');
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <LandingNav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
        >
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-white">AIUI Quick Setup</h1>
        <p className="mt-2 text-zinc-400 mb-8">
          Get an API key and connect your AI coding assistant in 30 seconds.
        </p>

        {step === 'email' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-400 mb-4">
                  {error}
                </div>
              )}

              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 px-3.5 py-2.5 text-base focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none mb-4"
              />

              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 px-3.5 py-2.5 text-base focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none mb-6"
              />

              <button
                type="submit"
                className="w-full bg-lime-500 hover:bg-lime-400 text-zinc-950 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors"
              >
                Get API Key
              </button>
            </form>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-10 text-zinc-400">Setting up your account...</div>
        )}

        {step === 'done' && result && (
          <div>
            <div className="rounded-lg bg-lime-950/30 border border-lime-500/30 px-5 py-4 mb-6">
              <div className="font-semibold text-lime-400 mb-1">Your API Key</div>
              <code className="text-sm break-all block mb-2 text-lime-400">{result.apiKey}</code>
              <button
                onClick={() => copyToClipboard(result.apiKey, 'key')}
                className="bg-lime-600 hover:bg-lime-500 text-zinc-950 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {copied === 'key' ? 'Copied!' : 'Copy'}
              </button>
              <p className="text-xs text-zinc-400 mt-2 mb-0">
                Save this key — it will not be shown again.
              </p>
            </div>

            <h2 className="text-lg font-semibold text-white mb-3">Connect Your AI Assistant</h2>

            <SetupBlock
              title="Claude Code"
              code={`claude mcp add --transport http aiui ${result.mcpUrl} --header "Authorization:Bearer ${result.apiKey}"`}
              copied={copied}
              onCopy={copyToClipboard}
              id="claude"
            />

            <SetupBlock
              title="Cursor (.cursor/mcp.json)"
              code={JSON.stringify(
                {
                  mcpServers: {
                    aiui: {
                      type: 'http',
                      url: result.mcpUrl,
                      headers: { Authorization: `Bearer ${result.apiKey}` },
                    },
                  },
                },
                null,
                2
              )}
              copied={copied}
              onCopy={copyToClipboard}
              id="cursor"
            />

            <SetupBlock
              title="VS Code (settings.json)"
              code={JSON.stringify(
                {
                  'mcp.servers': {
                    aiui: {
                      type: 'http',
                      url: result.mcpUrl,
                      headers: { Authorization: `Bearer ${result.apiKey}` },
                    },
                  },
                },
                null,
                2
              )}
              copied={copied}
              onCopy={copyToClipboard}
              id="vscode"
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function SetupBlock({
  title,
  code,
  copied,
  onCopy,
  id,
}: {
  title: string;
  code: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
  id: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors"
        >
          {copied === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="rounded-lg bg-slate-800 text-slate-200 px-4 py-3 text-[13px] overflow-auto whitespace-pre-wrap break-all m-0">
        {code}
      </pre>
    </div>
  );
}
