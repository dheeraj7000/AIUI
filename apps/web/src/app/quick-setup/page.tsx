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
    <div
      style={{
        maxWidth: 640,
        margin: '60px auto',
        padding: '0 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>AIUI Quick Setup</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Get an API key and connect your AI coding assistant in 30 seconds.
      </p>

      {step === 'email' && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              marginBottom: 24,
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Get API Key
          </button>
        </form>
      )}

      {step === 'loading' && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Setting up your account...
        </div>
      )}

      {step === 'done' && result && (
        <div>
          <div
            style={{
              padding: '16px 20px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 600, color: '#166534', marginBottom: 4 }}>Your API Key</div>
            <code
              style={{
                fontSize: 14,
                wordBreak: 'break-all',
                display: 'block',
                marginBottom: 8,
              }}
            >
              {result.apiKey}
            </code>
            <button
              onClick={() => copyToClipboard(result.apiKey, 'key')}
              style={{
                padding: '6px 12px',
                background: '#166534',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {copied === 'key' ? 'Copied!' : 'Copy'}
            </button>
            <p style={{ fontSize: 13, color: '#666', marginTop: 8, marginBottom: 0 }}>
              Save this key — it will not be shown again.
            </p>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Connect Your AI Assistant
          </h2>

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
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        <button
          onClick={() => onCopy(code, id)}
          style={{
            padding: '4px 10px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {copied === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          padding: '12px 16px',
          background: '#1e293b',
          color: '#e2e8f0',
          borderRadius: 8,
          fontSize: 13,
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          margin: 0,
        }}
      >
        {code}
      </pre>
    </div>
  );
}
