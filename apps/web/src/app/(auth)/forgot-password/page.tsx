'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

type Step = 'request' | 'confirm';

const inputClass =
  'block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-all duration-200';

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

  if (step === 'request') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Reset your password</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">
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
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending code...' : 'Send reset code'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/sign-in"
            className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-2">Set new password</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Enter the verification code sent to <span className="font-medium text-white">{email}</span>{' '}
        and your new password.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-zinc-400 mb-1">
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
          <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-400 mb-1">
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
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-lime-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setStep('request');
            setCode('');
            setNewPassword('');
            setError('');
          }}
          className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
        >
          Try a different email
        </button>
        <Link
          href="/sign-in"
          className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
