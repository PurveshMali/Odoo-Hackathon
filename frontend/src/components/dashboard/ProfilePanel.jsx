import { useState, useEffect } from 'react';
import { User, Mail, Shield, Clock, Key, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-[12px] py-[12px] border-b border-border-default last:border-0 hover:bg-[#FAFAF8] -mx-[24px] px-[24px] transition-none">
    <div className="w-[16px] h-[16px] text-secondary flex items-center justify-center shrink-0">
      <Icon className="w-[14px] h-[14px]" />
    </div>
    <div className="flex-1 flex items-center justify-between">
      <p className="text-[12px] text-secondary font-medium">{label}</p>
      <p className="text-[13px] font-medium text-primary uppercase font-mono tracking-[0.02em]">{value || '—'}</p>
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

  const renderPasswordField = (name, label) => {
    const sectionName = name.replace('Password', '').toLowerCase();
    const isShow = show[sectionName];
    return (
      <div>
        <label className="block text-[12px] text-secondary font-medium mb-[4px]">{label}</label>
        <div className="relative">
          <input
            name={name}
            type={isShow ? 'text' : 'password'}
            value={cpForm[name]}
            onChange={handleCpChange}
            required
            className="w-full h-[40px] border border-border-default rounded-[6px] px-[12px] bg-surface text-[13px] text-primary outline-none placeholder:text-muted focus:border-primary transition-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((p) => ({ ...p, [sectionName]: !p[sectionName] }))}
            className="absolute inset-y-0 right-[12px] flex items-center text-muted hover:text-primary transition-none"
          >
            {isShow ? <EyeOff className="w-[14px] h-[14px]" /> : <Eye className="w-[14px] h-[14px]" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-[24px] max-w-2xl pb-[64px]">
      <div>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-primary">My Profile</h1>
        <p className="text-[13px] text-secondary mt-1">Your account details and security settings.</p>
      </div>

      {/* Profile card */}
      <div className="bg-surface border border-border-default rounded-[6px] overflow-hidden">
        {/* Avatar header */}
        <div className="bg-page px-[24px] py-[24px] flex items-start gap-[16px] border-b border-border-default">
          <div className="w-[64px] h-[64px] rounded-[6px] bg-[#222222] text-sidebar-muted flex items-center justify-center font-mono text-[24px] uppercase shrink-0">
            {profile?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-primary font-medium text-[16px]">{loading ? 'Loading…' : profile?.name}</h2>
            <p className="text-secondary text-[13px] mt-[2px]">{profile?.email}</p>
            <span className="inline-block mt-[12px] px-[6px] py-[2px] bg-surface border border-border-default text-primary text-[11px] font-mono tracking-[0.03em] rounded-[4px] uppercase">
              {profile?.role}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-[24px] py-[8px]">
          {profile && (
            <>
              <InfoRow icon={Mail}   label="Email"       value={profile.email} />
              <InfoRow icon={Shield} label="Role"        value={<span className="capitalize">{profile.role}</span>} />
              <InfoRow icon={User}   label="Company"     value={profile.company?.name} />
              <InfoRow icon={Clock}  label="Last Login"  value={fmt(profile.lastLoginAt) || 'First login'} />
              <InfoRow icon={Clock}  label="Member Since" value={fmt(profile.createdAt)} />
            </>
          )}
          {loading && <p className="py-[24px] text-[13px] text-muted text-center">Loading profile details...</p>}
        </div>
      </div>

      {/* Change Password card */}
      <div className="bg-surface border border-border-default rounded-[6px]">
        <div className="px-[24px] py-[16px] border-b border-border-default flex items-center gap-[8px]">
          <Key className="w-[14px] h-[14px] text-secondary" />
          <h2 className="text-[14px] font-medium text-primary">Change Password</h2>
        </div>

        <form onSubmit={handleCpSubmit} className="px-[24px] py-[24px] space-y-[16px]">
          {cpError   && <div className="bg-white border border-danger text-danger rounded-[4px] px-[12px] py-[8px] text-[13px]">{cpError}</div>}
          {cpSuccess && (
            <div className="bg-white border border-success text-success rounded-[4px] px-[12px] py-[8px] text-[13px] flex items-center gap-[8px]">
              <CheckCircle className="w-[14px] h-[14px]" /> Password changed successfully!
            </div>
          )}

          {renderPasswordField('currentPassword', 'Current Password')}
          {renderPasswordField('newPassword', 'New Password (min. 8 chars, upper, lower, number, special)')}
          {renderPasswordField('confirmPassword', 'Confirm New Password')}

          <div className="pt-[8px]">
            <button type="submit" disabled={cpLoading}
              className="inline-flex items-center justify-center gap-[8px] px-[16px] h-[36px] text-[13px] font-medium text-white bg-primary rounded-[4px] hover:bg-[#2A2A2A] disabled:opacity-60 transition-none"
            >
              {cpLoading ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : null}
              {cpLoading ? 'Changing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
