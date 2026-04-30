import * as React from 'react';
import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailInvalid = emailTouched && email.length > 0 && !EMAIL_RE.test(email);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailTouched(true);
    if (emailInvalid || !email || !password) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-muted">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-background rounded-md p-8 border border-border"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to continue building.</p>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? 'email-error' : undefined}
            className={[
              'w-full px-3 py-2 rounded-md text-sm border outline-none transition-colors',
              emailInvalid
                ? 'border-destructive focus:border-destructive'
                : 'border-border focus:border-primary',
            ].join(' ')}
            placeholder="you@example.com"
          />
          {emailInvalid && (
            <p id="email-error" className="mt-1 text-sm text-destructive">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-16 rounded-md text-sm border border-border focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary px-2 py-1 rounded-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded-sm border-border text-primary"
          />
          <span className="text-sm text-foreground">Remember me for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-md bg-primary text-background font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                <path d="M21 12a9 9 0 0 1-9 9" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <a href="/forgot" className="block text-center mt-4 text-sm text-primary hover:opacity-80">
          Forgot your password?
        </a>
      </form>
    </div>
  );
}
