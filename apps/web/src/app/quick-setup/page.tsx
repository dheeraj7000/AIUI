'use client';

import { useState } from 'react';

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
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-900">AIUI Quick Setup</h1>
      <p className="mt-2 text-gray-500 mb-8">
        Get an API key and connect your AI coding assistant in 30 seconds.
      </p>

      {step === 'email' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none mb-6"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-base font-semibold transition-colors"
            >
              Get API Key
            </button>
          </form>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center py-10 text-gray-500">Setting up your account...</div>
      )}

      {step === 'done' && result && (
        <div>
          <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-4 mb-6">
            <div className="font-semibold text-green-800 mb-1">Your API Key</div>
            <code className="text-sm break-all block mb-2">{result.apiKey}</code>
            <button
              onClick={() => copyToClipboard(result.apiKey, 'key')}
              className="bg-green-800 hover:bg-green-900 text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {copied === 'key' ? 'Copied!' : 'Copy'}
            </button>
            <p className="text-xs text-gray-500 mt-2 mb-0">
              Save this key — it will not be shown again.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-3">Connect Your AI Assistant</h2>

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
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors"
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
