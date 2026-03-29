import { useState, useEffect } from 'react';
import { X, Pencil, Loader2 } from 'lucide-react';
import { usersApi } from '../../services/api';

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm]       = useState({ name: user.name, role: user.role, managerId: user.managerId || '' });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    usersApi.getManagers().then((d) => setManagers(d?.managers || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = {
        name:      form.name,
        role:      form.role,
        managerId: form.managerId || null,
      };
      const data = await usersApi.update(user.id, body);
      onUpdated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Edit Member</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              Admin role and permissions cannot be changed through this form.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required disabled={isAdmin}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {!isAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Manager <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select name="managerId" value={form.managerId} onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">— No manager —</option>
                  {managers.filter((m) => m.id !== user.id).map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading || isAdmin}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
