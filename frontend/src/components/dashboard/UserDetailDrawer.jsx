import { useEffect, useState } from 'react';
import { X, Mail, Shield, Clock, Send, AlertCircle, CheckCircle, User } from 'lucide-react';
import { usersApi } from '../../services/api';

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 shrink-0 w-36">{label}</span>
    <span className={`text-sm font-medium text-right ${highlight || 'text-slate-800'}`}>{value || '—'}</span>
  </div>
);

const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;

export default function UserDetailDrawer({ userId, onClose }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    usersApi.getById(userId)
      .then((d) => setUser(d.user))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
              {user?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{user?.name || 'Loading…'}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && <p className="text-sm text-slate-400 text-center py-8">Loading profile…</p>}
          {error   && <p className="text-sm text-red-600 text-center py-8">{error}</p>}

          {user && (
            <div className="space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize
                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  <Shield className="w-3 h-3" />{user.role}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border
                  ${user.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {user.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {user.mustChangePassword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-700 border-amber-200">
                    <AlertCircle className="w-3 h-3" />Pwd. Change Required
                  </span>
                )}
              </div>

              {/* Detail rows */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Account Info</h3>
                <div className="bg-slate-50 rounded-xl px-4">
                  <Row label="Full Name"   value={user.name} />
                  <Row label="Email"       value={user.email} />
                  <Row label="Role"        value={<span className="capitalize">{user.role}</span>} />
                  <Row label="Manager"    value={user.manager?.name || '—'} />
                  <Row label="Status"     value={user.isActive ? 'Active' : 'Deactivated'}
                    highlight={user.isActive ? 'text-emerald-600' : 'text-red-500'} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Activity</h3>
                <div className="bg-slate-50 rounded-xl px-4">
                  <Row label="Last Login"     value={fmt(user.lastLoginAt) || 'Never'} />
                  <Row label="Credentials Sent" value={fmt(user.passwordSentAt) || 'Never'} />
                  <Row label="Member Since"   value={fmt(user.createdAt)} />
                  <Row label="Last Updated"   value={fmt(user.updatedAt)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
