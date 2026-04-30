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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-[60px]"
      style={{
        background: 'linear-gradient(135deg, #FFE4E1 0%, #FFF8DC 50%, #E0F6FF 100%)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] bg-white rounded-[20px] p-[36px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)]"
      >
        <h1
          className="text-[28px] font-bold text-[#0B1F3A] mb-[6px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Welcome back
        </h1>
        <p className="text-[14.5px] text-[#5B6B7E] mb-[28px]">Sign in to continue building.</p>

        <div className="mb-[18px]">
          <label htmlFor="email" className="block text-[13px] font-medium text-[#1E2A3A] mb-[6px]">
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
              'w-full px-[14px] py-[11px] rounded-[10px] text-[15px] border-[1.5px] outline-none transition-colors',
              emailInvalid
                ? 'border-[#DC2626] focus:border-[#B91C1C]'
                : 'border-[#D6DEE8] focus:border-[#3B82F6]',
            ].join(' ')}
            placeholder="you@example.com"
          />
          {emailInvalid && (
            <p id="email-error" className="mt-[5px] text-[12.5px] text-[#DC2626]">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div className="mb-[18px]">
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-[#1E2A3A] mb-[6px]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-[14px] py-[11px] pr-[68px] rounded-[10px] text-[15px] border-[1.5px] border-[#D6DEE8] focus:border-[#3B82F6] outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#3B82F6] hover:text-[#1D4ED8] px-[8px] py-[6px] rounded-[6px]"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 mb-[24px] cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-[16px] h-[16px] rounded-[4px] border-[#D6DEE8] text-[#3B82F6]"
          />
          <span className="text-[13.5px] text-[#1E2A3A]">Remember me for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-[13px] rounded-[10px] bg-[#3B82F6] text-white font-semibold text-[15px] hover:bg-[#2563EB] disabled:bg-[#94A3B8] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg
                className="w-[16px] h-[16px] animate-spin"
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

        <a
          href="/forgot"
          className="block text-center mt-[18px] text-[13px] text-[#3B82F6] hover:text-[#1D4ED8]"
        >
          Forgot your password?
        </a>
      </form>
    </div>
  );
}
