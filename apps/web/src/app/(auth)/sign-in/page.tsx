'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
}

const inputClass =
  'block w-full px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-150 focus:outline-none auth-input';

const oauthErrors: Record<string, string> = {
  google_not_configured: 'Google sign-in is not configured on this server.',
  invalid_state: 'Sign-in session expired. Please try again.',
  token_exchange_failed: 'Could not complete Google sign-in. Please try again.',
  userinfo_failed: 'Could not read your Google profile. Please try again.',
  email_not_verified: 'Your Google account email is not verified.',
  access_denied: 'You declined to grant access to your Google account.',
  internal_error: 'An unexpected error occurred. Please try again.',
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Surface OAuth errors from the callback redirect
  useEffect(() => {
    const err = searchParams?.get('error');
    if (err) {
      setServerError(oauthErrors[err] ?? `Sign-in failed (${err})`);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate(email, password);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.isSignedIn) {
        router.push('/dashboard');
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2
        className="text-[1.5rem] leading-[1.15]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
      >
        Sign in to your account.
      </h2>
      <p className="mt-2 mb-6 text-[0.9375rem]" style={{ color: 'var(--ink-soft)' }}>
        Welcome back. Enter your credentials to continue.
      </p>

      {serverError && (
        <div
          className="mb-4 flex items-start gap-2 p-3"
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
          }}
        >
          <p className="text-[0.875rem]" style={{ color: 'var(--accent-deep)' }}>
            {serverError}
          </p>
        </div>
      )}

      <GoogleSignInButton />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'var(--rule)' }} />
        <span
          className="text-[0.6875rem] uppercase tracking-[0.12em]"
          style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono-editorial)' }}
        >
          or
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--rule)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-[0.8125rem] mb-1.5"
            style={{ color: 'var(--ink)' }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1.5 text-[0.75rem]"
              style={{ color: 'var(--accent)' }}
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-[0.8125rem]"
              style={{ color: 'var(--ink)' }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[0.75rem] transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1.5 text-[0.75rem]"
              style={{ color: 'var(--accent)' }}
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[0.875rem]" style={{ color: 'var(--ink-soft)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="transition-colors" style={{ color: 'var(--accent)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
