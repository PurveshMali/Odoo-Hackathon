import { useState, useEffect } from 'react';
import { User, Mail, Shield, Clock, Key, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
    </div>
  </div>
);

const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : null;

export default function ProfilePanel() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const [cpForm, setCpForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError]   = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);
  const [show, setShow]         = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    authApi.me()
      .then((d) => setProfile(d.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCpChange = (e) => {
    setCpForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setCpError('');
    setCpSuccess(false);
  };

  const handleCpSubmit = async (e) => {
    e.preventDefault();
    if (cpForm.newPassword !== cpForm.confirmPassword) {
      return setCpError('New passwords do not match.');
    }
    setCpLoading(true);
    setCpError('');
    try {
      await authApi.changePassword({
        currentPassword:  cpForm.currentPassword,
        newPassword:      cpForm.newPassword,
        confirmPassword:  cpForm.confirmPassword,
      });
      setCpSuccess(true);
      setCpForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Refresh profile to clear mustChangePassword flag
      authApi.me().then((d) => setProfile(d.user)).catch(() => {});
    } catch (err) {
      setCpError(err.message);
    } finally {
      setCpLoading(false);
    }
  };

  const PasswordField = ({ name, label }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show[name.replace('Password', '').toLowerCase()] ? 'text' : 'password'}
          value={cpForm[name]}
          onChange={handleCpChange}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [name.replace('Password', '').toLowerCase()]: !p[name.replace('Password', '').toLowerCase()] }))}
          className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
        >
          {show[name.replace('Password', '').toLowerCase()] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your account details and security settings.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-2xl uppercase border-2 border-white/30">
            {profile?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{loading ? 'Loading…' : profile?.name}</h2>
            <p className="text-indigo-200 text-sm">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full capitalize border border-white/30">
              {profile?.role}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-6">
          {profile && (
            <>
              <InfoRow icon={Mail}   label="Email"       value={profile.email} />
              <InfoRow icon={Shield} label="Role"        value={<span className="capitalize">{profile.role}</span>} />
              <InfoRow icon={User}   label="Company"     value={profile.company?.name} />
              <InfoRow icon={Clock}  label="Last Login"  value={fmt(profile.lastLoginAt) || 'First login'} />
              <InfoRow icon={Clock}  label="Member Since" value={fmt(profile.createdAt)} />
            </>
          )}
          {loading && <p className="py-6 text-sm text-slate-400 text-center">Loading…</p>}
        </div>
      </div>

      {/* Change Password card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
        </div>

        <form onSubmit={handleCpSubmit} className="px-6 py-5 space-y-4">
          {cpError   && <div className="bg-red-50 border-l-4 border-red-500 rounded p-3 text-sm text-red-700">{cpError}</div>}
          {cpSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded p-3 text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Password changed successfully!
            </div>
          )}

          <PasswordField name="currentPassword" label="Current Password" />
          <PasswordField name="newPassword"     label="New Password (min. 8 chars, upper, lower, number, special)" />
          <PasswordField name="confirmPassword" label="Confirm New Password" />

          <div className="pt-1">
            <button type="submit" disabled={cpLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {cpLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Changing…</> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
