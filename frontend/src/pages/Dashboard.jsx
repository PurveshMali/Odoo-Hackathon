import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, User, LogOut, Menu, X,
  ChevronRight, Building2,
} from 'lucide-react';
import TeamPanel    from '../components/dashboard/TeamPanel';
import ProfilePanel from '../components/dashboard/ProfilePanel';
import { authApi }  from '../services/api';

/* ────────────── Sidebar Nav Item ─────────────────────── */
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
      ${active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`
    }
  >
    <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
        ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}
      >
        {badge}
      </span>
    )}
  </button>
);

/* ────────────── Overview Panel ──────────────────────── */
const OverviewPanel = ({ user }) => {
  const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'First login';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's an overview of your workspace.</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{user?.company?.name || '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Currency: {user?.company?.currencyCode || 'USD'}</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <User className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Role</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5 capitalize">{user?.role || '—'}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.email}</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Login</p>
          <p className="text-base font-bold text-slate-800 mt-0.5">{fmt(user?.lastLoginAt)}</p>
          <p className="text-xs text-slate-400 mt-1">Previous session</p>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">Reimbursements coming soon</h2>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Expense submissions, approvals, and reports are currently in development.
        </p>
      </div>
    </div>
  );
};

/* ────────────── Dashboard Shell ─────────────────────── */
export default function Dashboard() {
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin    = user.role === 'admin';

  const [section,    setSection]    = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ...(isAdmin ? [{ id: 'team', label: 'Team', icon: Users }] : []),
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
            E
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-none">Expensio</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">
              {user?.company?.name || 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon }) => (
          <NavItem
            key={id}
            icon={icon}
            label={label}
            active={section === id}
            onClick={() => { setSection(id); setSidebarOpen(false); }}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-200/60 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200/70 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200/70 px-4 sm:px-6 py-3.5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700 capitalize">
              {navItems.find((n) => n.id === section)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user?.mustChangePassword && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                ⚠ Password change required
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
              {user?.name?.charAt(0) || '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {section === 'overview' && <OverviewPanel user={user} />}
          {section === 'team'     && isAdmin && <TeamPanel currentUserId={user.id} />}
          {section === 'profile'  && <ProfilePanel />}
        </main>
      </div>
    </div>
  );
}
