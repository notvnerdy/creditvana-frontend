import { useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  logout as apiLogout,
  upgradePlan,
  downgradePlan,
} from '../api/client.ts';
import type { UserProfile, APIError } from '../types/index.ts';
import Card from '../components/common/Card.tsx';
import Input from '../components/common/Input.tsx';
import Select from '../components/common/Select.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import Modal from '../components/common/Modal.tsx';
import StatusBadge from '../components/common/StatusBadge.tsx';
import { maskSSN, formatDate } from '../utils/formatters.ts';
import { useStates } from '../hooks/useStates.ts';
import { useCitySuggestions } from '../hooks/useCitySuggestions.ts';

export default function SettingsPage() {
  const { signOut, isUpgraded, setUpgraded } = useAuth();
  const navigate = useNavigate();
  const states = useStates();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile edit state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const citySuggestions = useCitySuggestions(editForm.city);

  // Password change state
  const [pwForm, setPwForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Subscription state
  const [subLoading, setSubLoading] = useState(false);
  const [subFeedback, setSubFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
      setUpgraded(data.is_upgraded === 1);
      setEditForm({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        phone: data.phone ?? '',
        street: data.street ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zip ?? '',
      });
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  }, [setUpgraded]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      const updated = await updateProfile(editForm);
      setProfile(updated);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      const apiErr = err as APIError;
      setProfileError(apiErr.message || 'Unable to update your profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.password !== pwForm.password_confirmation) {
      setPwError('Passwords do not match.');
      return;
    }
    if (pwForm.password.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(pwForm);
      setPwSuccess('Password changed successfully.');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      const apiErr = err as APIError;
      setPwError(apiErr.message || 'Unable to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      try { await apiLogout(); } catch { /* ignore */ }
      signOut();
      navigate('/login');
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to delete your account. Please contact support.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubscriptionAction = async (action: 'upgrade' | 'downgrade') => {
    setSubLoading(true);
    setSubFeedback(null);
    try {
      const resp = action === 'upgrade' ? await upgradePlan() : await downgradePlan();
      // Reflect the new plan immediately, then reconcile with the server.
      setUpgraded(action === 'upgrade');
      setSubFeedback({
        variant: 'success',
        message:
          resp.message ||
          `Successfully ${action === 'upgrade' ? 'upgraded' : 'downgraded'} your plan.`,
      });
      // Refresh profile to get updated status
      await fetchProfile();
    } catch (err) {
      const apiErr = err as APIError;
      setSubFeedback({
        variant: 'error',
        message: apiErr.message || `Unable to ${action} your plan.`,
      });
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <LoadingSpinner size="lg" label="Loading your settings..." className="min-h-[300px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Account Settings</h1>

      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Section */}
      <Card className="mb-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Profile Information</h2>
        <p className="mb-6 text-sm text-slate-500">
          Update your personal details below
        </p>

        {/* Read-only fields */}
        {profile && (
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{profile.email ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">SSN</p>
              <p className="text-sm text-slate-700">{maskSSN(profile.ssn)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Date of Birth</p>
              <p className="text-sm text-slate-700">{formatDate(profile.dob)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Verification</p>
              <StatusBadge
                status={profile.kba_passed === 1 ? 'verified' : 'pending'}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Member Since</p>
              <p className="text-sm text-slate-700">{formatDate(profile.created_at)}</p>
            </div>
          </div>
        )}

        {profileSuccess && (
          <Alert variant="success" className="mb-4" onDismiss={() => setProfileSuccess('')}>
            {profileSuccess}
          </Alert>
        )}
        {profileError && (
          <Alert variant="error" className="mb-4" onDismiss={() => setProfileError('')}>
            {profileError}
          </Alert>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="first_name"
              value={editForm.first_name}
              onChange={handleEditChange}
              disabled={profileSaving}
            />
            <Input
              label="Last name"
              name="last_name"
              value={editForm.last_name}
              onChange={handleEditChange}
              disabled={profileSaving}
            />
          </div>
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={editForm.phone}
            onChange={handleEditChange}
            disabled={profileSaving}
          />
          <Input
            label="Street"
            name="street"
            value={editForm.street}
            onChange={handleEditChange}
            disabled={profileSaving}
          />
          <div className="grid grid-cols-4 gap-3">
            <Input
              label="City"
              name="city"
              list="settings-city-suggestions"
              value={editForm.city}
              onChange={handleEditChange}
              disabled={profileSaving}
              className="col-span-2"
            />
            <datalist id="settings-city-suggestions">
              {citySuggestions.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            <Select
              label="State"
              name="state"
              placeholder="Select"
              options={states.map((state) => ({
                value: state.code,
                label: state.code,
              }))}
              value={editForm.state}
              onChange={handleEditChange}
              disabled={profileSaving}
            />
            <Input
              label="ZIP"
              name="zip"
              value={editForm.zip}
              onChange={handleEditChange}
              disabled={profileSaving}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={profileSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="mb-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Change Password</h2>
        <p className="mb-6 text-sm text-slate-500">
          Update your password to keep your account secure
        </p>

        {pwSuccess && (
          <Alert variant="success" className="mb-4" onDismiss={() => setPwSuccess('')}>
            {pwSuccess}
          </Alert>
        )}
        {pwError && (
          <Alert variant="error" className="mb-4" onDismiss={() => setPwError('')}>
            {pwError}
          </Alert>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            value={pwForm.current_password}
            onChange={handlePwChange}
            disabled={pwSaving}
            required
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={pwForm.password}
              onChange={handlePwChange}
              disabled={pwSaving}
              hint="Minimum 8 characters"
              required
            />
            <Input
              label="Confirm new password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={pwForm.password_confirmation}
              onChange={handlePwChange}
              disabled={pwSaving}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={pwSaving}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Subscription Section */}
      <Card className="mb-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Subscription</h2>
        <p className="mb-4 text-sm text-slate-500">
          Manage your credit monitoring plan
        </p>

        {subFeedback && (
          <Alert
            variant={subFeedback.variant}
            className="mb-4"
            onDismiss={() => setSubFeedback(null)}
          >
            {subFeedback.message}
          </Alert>
        )}

        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              Current Plan: {isUpgraded ? 'Premium' : 'Basic'}
            </p>
            <p className="text-xs text-slate-500">
              {isUpgraded
                ? 'Full access to all credit monitoring features'
                : 'Standard credit score monitoring'}
            </p>
          </div>
          {isUpgraded ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSubscriptionAction('downgrade')}
              loading={subLoading}
            >
              Downgrade
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSubscriptionAction('upgrade')}
              loading={subLoading}
            >
              Upgrade to Premium
            </Button>
          )}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <h2 className="mb-1 text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="mb-4 text-sm text-slate-500">
          Permanently delete your account and all associated data
        </p>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </Button>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <Alert variant="error">
            This action is permanent and cannot be undone. All your data,
            including credit monitoring history, will be permanently removed.
          </Alert>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
