'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

type Step = 'request' | 'confirm';

const inputClass =
  'block w-full px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-150 focus:outline-none auth-input';
const labelClass = 'block text-[0.8125rem] mb-1.5';
const headingStyle = { fontFamily: 'var(--font-display)', color: 'var(--ink)' } as const;
const subStyle = { color: 'var(--ink-soft)' } as const;
const linkStyle = { color: 'var(--accent)' } as const;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, confirmForgotPassword } = useAuth();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      router.push('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function ErrorBox() {
    if (!error) return null;
    return (
      <div
        className="mb-4 p-3"
        style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
      >
        <p className="text-[0.875rem]" style={{ color: 'var(--accent-deep)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (step === 'request') {
    return (
      <div>
        <h2 className="text-[1.5rem] leading-[1.15]" style={headingStyle}>
          Reset your password.
        </h2>
        <p className="mt-2 mb-6 text-[0.9375rem]" style={subStyle}>
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>

        <ErrorBox />

        <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className={labelClass} style={{ color: 'var(--ink)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending code…' : 'Send reset code'}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.875rem]" style={subStyle}>
          <Link href="/sign-in" className="transition-colors" style={linkStyle}>
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[1.5rem] leading-[1.15]" style={headingStyle}>
        Set new password.
      </h2>
      <p className="mt-2 mb-6 text-[0.9375rem]" style={subStyle}>
        Enter the verification code sent to{' '}
        <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono-editorial)' }}>
          {email}
        </span>{' '}
        and your new password.
      </p>

      <ErrorBox />

      <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
        <div>
          <label htmlFor="code" className={labelClass} style={{ color: 'var(--ink)' }}>
            Verification code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`${inputClass} text-center text-lg tracking-widest`}
            placeholder="000000"
            autoComplete="one-time-code"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className={labelClass} style={{ color: 'var(--ink)' }}>
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting password…' : 'Reset password'}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-[0.875rem]">
        <button
          type="button"
          onClick={() => {
            setStep('request');
            setCode('');
            setNewPassword('');
            setError('');
          }}
          className="transition-colors"
          style={linkStyle}
        >
          Try a different email
        </button>
        <Link href="/sign-in" className="transition-colors" style={linkStyle}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
