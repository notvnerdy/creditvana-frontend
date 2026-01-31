import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/client.ts';
import type { APIError } from '../types/index.ts';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      const apiErr = err as APIError;
      setError(
        apiErr.message || 'Unable to send reset instructions. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we&apos;ll send you instructions
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
            <p className="mt-2 text-sm text-slate-500">
              If an account exists for <strong>{email}</strong>, you&apos;ll receive
              password reset instructions shortly.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Instructions
              </Button>
            </form>
          </>
        )}
      </div>

      {!success && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
