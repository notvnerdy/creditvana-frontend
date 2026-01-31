import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { register } from '../api/client.ts';
import type { APIError } from '../types/index.ts';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import {
  validateRegistration,
  formatSSNInput,
  formatPhoneInput,
  type RegistrationErrors,
} from '../utils/validators.ts';

interface FormFields {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  dob: string;
  ssn: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const initialForm: FormFields = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  dob: '',
  ssn: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
};

export default function RegisterPage() {
  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormFields>(initialForm);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'ssn') formattedValue = formatSSNInput(value);
    if (name === 'phone') formattedValue = formatPhoneInput(value);

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    // Clear field error on change
    if (errors[name as keyof RegistrationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateRegistration(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await register({
        ...form,
        phone: form.phone.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3'),
      });
      handleAuthSuccess(data);

      if (data.kba_passed === 0) {
        navigate('/verify');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const apiErr = err as APIError;
      if (apiErr.errors) {
        // Map server validation errors to fields
        const fieldErrors: RegistrationErrors = {};
        for (const [key, messages] of Object.entries(apiErr.errors)) {
          (fieldErrors as Record<string, string>)[key] = messages[0] ?? '';
        }
        setErrors(fieldErrors);
      } else {
        setServerError(
          apiErr.message || 'Registration failed. Please try again later.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Start monitoring your credit in minutes
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {serverError && (
          <Alert variant="error" className="mb-4" onDismiss={() => setServerError('')}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={handleChange}
              error={errors.first_name}
              disabled={loading}
              required
            />
            <Input
              label="Last name"
              name="last_name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={handleChange}
              error={errors.last_name}
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
            required
          />

          {/* Password */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
              required
            />
            <Input
              label="Confirm password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={form.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              disabled={loading}
              required
            />
          </div>

          {/* Personal info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Date of birth"
              name="dob"
              type="date"
              autoComplete="bday"
              value={form.dob}
              onChange={handleChange}
              error={errors.dob}
              disabled={loading}
              required
            />
            <Input
              label="Social Security Number"
              name="ssn"
              type="text"
              inputMode="numeric"
              placeholder="XXX-XX-XXXX"
              value={form.ssn}
              onChange={handleChange}
              error={errors.ssn}
              disabled={loading}
              required
              hint="Required for identity verification"
            />
          </div>

          <Input
            label="Phone number"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={loading}
            required
          />

          {/* Address */}
          <Input
            label="Street address"
            name="street"
            autoComplete="street-address"
            placeholder="123 Main St"
            value={form.street}
            onChange={handleChange}
            error={errors.street}
            disabled={loading}
            required
          />

          <div className="grid grid-cols-4 gap-3">
            <Input
              label="City"
              name="city"
              autoComplete="address-level2"
              value={form.city}
              onChange={handleChange}
              error={errors.city}
              disabled={loading}
              className="col-span-2"
              required
            />
            <div>
              <label
                htmlFor="state"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                autoComplete="address-level1"
                placeholder="CA"
                maxLength={2}
                value={form.state}
                onChange={handleChange}
                disabled={loading}
                required
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                  errors.state
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
            <Input
              label="ZIP"
              name="zip"
              autoComplete="postal-code"
              inputMode="numeric"
              placeholder="90210"
              maxLength={10}
              value={form.zip}
              onChange={handleChange}
              error={errors.zip}
              disabled={loading}
              required
            />
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-blue-700">
              Your personal information is encrypted and securely transmitted.
              We use it solely for identity verification and credit monitoring.
            </p>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {loading ? 'Creating your account...' : 'Create Account'}
          </Button>

          {loading && (
            <p className="text-center text-xs text-slate-500">
              This may take a few moments while we verify your identity...
            </p>
          )}
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
