import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { requestOTP, verifyOTP } from '../api/client.ts';
import type { APIError } from '../types/index.ts';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';

type Step = 'email' | 'code';

export default function OTPLoginPage() {
  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const resp = await requestOTP({ email: email.trim() });
      setStep('code');
      setInfo(resp.message || 'A verification code has been sent to your email.');
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOTP({ email: email.trim(), otp: otp.trim() });
      handleAuthSuccess(data);

      if (data.kba_passed === 0) {
        navigate('/verify');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await requestOTP({ email: email.trim() });
      setInfo('A new verification code has been sent.');
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {step === 'email' ? 'Sign in with email' : 'Enter verification code'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {step === 'email'
            ? "We'll send a one-time code to your email"
            : `Code sent to ${email}`}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {error && (
          <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}
        {info && (
          <Alert variant="info" className="mb-4" onDismiss={() => setInfo('')}>
            {info}
          </Alert>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
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
              Send Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Verify & Sign In
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400"
              >
                Resend code
              </button>
              <span className="mx-2 text-slate-300">|</span>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo(''); }}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Use different email
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in with password instead
        </Link>
      </p>
    </div>
  );
}
