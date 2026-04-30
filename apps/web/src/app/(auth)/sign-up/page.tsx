'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(email: string, password: string, confirmPassword: string): FormErrors {
  const errors: FormErrors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

const inputClass =
  'block w-full px-3.5 py-2.5 text-[0.9375rem] transition-colors duration-150 focus:outline-none auth-input';

const labelClass = 'block text-[0.8125rem] mb-1.5';
const errorClass = 'mt-1.5 text-[0.75rem]';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate(email, password, confirmPassword);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(email, password);
      // The signup route auto-creates a starter project, so the projects
      // list already has something to show. Sending the user straight to
      // /projects avoids the "empty dashboard" first impression.
      router.push('/projects');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
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
        Create your account.
      </h2>
      <p className="mt-2 mb-6 text-[0.9375rem]" style={{ color: 'var(--ink-soft)' }}>
        Free to start. Set up your design system in minutes.
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

      <GoogleSignInButton label="Sign up with Google" />

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
          <label htmlFor="email" className={labelClass} style={{ color: 'var(--ink)' }}>
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
            <p id="email-error" className={errorClass} style={{ color: 'var(--accent)' }}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={labelClass} style={{ color: 'var(--ink)' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className={errorClass} style={{ color: 'var(--accent)' }}>
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass} style={{ color: 'var(--ink)' }}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className={errorClass}
              style={{ color: 'var(--accent)' }}
            >
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-ink w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[0.875rem]" style={{ color: 'var(--ink-soft)' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="transition-colors" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
