import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Pencil, Send, UserX, UserCheck, ShieldAlert,
  CheckCircle, AlertCircle, Clock,
} from 'lucide-react';
import { usersApi } from '../../services/api';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import UserDetailDrawer from './UserDetailDrawer';

/* ── Small helpers ─────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const s = {
    admin:    'bg-purple-50 text-purple-700 border-purple-200',
    manager:  'bg-blue-50   text-blue-700   border-blue-200',
    employee: 'bg-slate-50  text-slate-500  border-slate-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${s[role] || s.employee}`}>
      {role}
    </span>
  );
};

const StatusPill = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

/* ── ActionButton ──────────────────────────────────────── */
const ActionBtn = ({ onClick, title, icon: Icon, color = 'slate', disabled = false }) => {
  const colors = {
    slate:   'hover:bg-slate-100 text-slate-500 hover:text-slate-700',
    indigo:  'hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700',
    amber:   'hover:bg-amber-100 text-amber-500 hover:text-amber-700',
    red:     'hover:bg-red-100 text-red-400 hover:text-red-600',
    emerald: 'hover:bg-emerald-100 text-emerald-500 hover:text-emerald-700',
  };
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className={`p-1.5 rounded-md transition-colors ${colors[color]} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

/* ── TeamPanel ─────────────────────────────────────────── */
export default function TeamPanel({ currentUserId }) {
  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading,    setLoading]    = useState(false);
  const [feedback,   setFeedback]   = useState({});   // { [userId]: {ok, msg} }
  const [sending,    setSending]    = useState({});   // { [userId]: bool }

  const [filters, setFilters] = useState({ search: '', role: '', isActive: '', page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');

  const [showCreate,  setShowCreate]  = useState(false);
  const [editUser,    setEditUser]    = useState(null);
  const [viewUserId,  setViewUserId]  = useState(null);

  const loadUsers = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const data = await usersApi.list(f);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line

  /* Search with debounce */
  useEffect(() => {
    const t = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput, page: 1 };
      setFilters(newFilters);
      loadUsers(newFilters);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line

  const applyFilter = (key, val) => {
    const newFilters = { ...filters, [key]: val, page: 1 };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  const goToPage = (p) => {
    const newFilters = { ...filters, page: p };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  /* ── Actions ── */
  const showFeedback = (userId, ok, msg) => {
    setFeedback((prev) => ({ ...prev, [userId]: { ok, msg } }));
    setTimeout(() => setFeedback((prev) => ({ ...prev, [userId]: null })), 4000);
  };

  const handleSendCredentials = async (userId) => {
    setSending((p) => ({ ...p, [userId]: true }));
    try {
      const data = await usersApi.sendCredentials(userId);
      showFeedback(userId, true, `Sent to ${data.sentTo}`);
      loadUsers();
    } catch (err) {
      showFeedback(userId, false, err.message);
    } finally {
      setSending((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user? They will be logged out immediately.')) return;
    try {
      await usersApi.deactivate(userId);
      showFeedback(userId, true, 'Deactivated');
      loadUsers();
    } catch (err) {
      showFeedback(userId, false, err.message);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await usersApi.reactivate(userId);
      showFeedback(userId, true, 'Reactivated — send credentials to allow login');
      loadUsers();
    } catch (err) {
      showFeedback(userId, false, err.message);
    }
  };

  const handleUserCreated = (newUser) => {
    setShowCreate(false);
    loadUsers();
    showFeedback(newUser.id, true, 'Created! Send credentials to allow login.');
  };

  const handleUserUpdated = (updatedUser) => {
    setEditUser(null);
    loadUsers();
    showFeedback(updatedUser.id, true, 'Updated successfully.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Team Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage users — create, update, deactivate, and send credentials.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <UserPlus className="w-4 h-4" />Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/70 rounded-xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <select value={filters.role} onChange={(e) => applyFilter('role', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>

        <select value={filters.isActive} onChange={(e) => applyFilter('isActive', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button onClick={() => loadUsers()} disabled={loading}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/70 rounded-xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Login</span>
          <span>Actions</span>
        </div>

        {loading && users.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">Loading team members…</div>
        )}
        {!loading && users.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No users found.</div>
        )}

        <div className="divide-y divide-slate-100">
          {users.map((member) => {
            const isSelf   = member.id === currentUserId;
            const fb       = feedback[member.id];

            return (
              <div key={member.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                {/* Member info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                      {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                      {member.mustChangePassword && (
                        <span title="Awaiting password change">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    {/* Feedback inline */}
                    {fb && (
                      <p className={`text-xs font-medium mt-0.5 ${fb.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                        {fb.ok ? '✓' : '✗'} {fb.msg}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div><RoleBadge role={member.role} /></div>

                {/* Status */}
                <div><StatusPill active={member.isActive} /></div>

                {/* Last login */}
                <div className="text-xs text-slate-400">{fmt(member.lastLoginAt)}</div>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                  <ActionBtn onClick={() => setViewUserId(member.id)} title="View details" icon={Eye} color="slate" />
                  {!isSelf && (
                    <>
                      <ActionBtn onClick={() => setEditUser(member)} title="Edit" icon={Pencil} color="amber" />
                      <ActionBtn
                        onClick={() => handleSendCredentials(member.id)}
                        title="Send Credentials"
                        icon={Send}
                        color="indigo"
                        disabled={sending[member.id]}
                      />
                      {member.isActive ? (
                        <ActionBtn onClick={() => handleDeactivate(member.id)} title="Deactivate" icon={UserX} color="red"
                          disabled={member.role === 'admin'} />
                      ) : (
                        <ActionBtn onClick={() => handleReactivate(member.id)} title="Reactivate" icon={UserCheck} color="emerald" />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {pagination.total} total · Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate  && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={handleUserCreated} />}
      {editUser    && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdated={handleUserUpdated} />}
      {viewUserId  && <UserDetailDrawer userId={viewUserId} onClose={() => setViewUserId(null)} />}
    </div>
  );
}
