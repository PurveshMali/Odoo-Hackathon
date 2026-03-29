import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, User, LogOut, Menu, X,
  ChevronRight, Building2, Receipt, ClipboardCheck,
  ShieldCheck, BarChart3,
  Clock,
} from 'lucide-react';
import TeamPanel      from '../components/dashboard/TeamPanel';
import ProfilePanel   from '../components/dashboard/ProfilePanel';
import ExpensesPanel  from '../components/dashboard/ExpensesPanel';
import ApprovalsPanel from '../components/dashboard/ApprovalsPanel';
import RulesPanel     from '../components/dashboard/RulesPanel';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';
import { authApi, dashboardApi }    from '../services/api';
import { useEffect } from 'react';


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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getEmployee();
        setStats(res.summary);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'First login';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's an overview of your workspace.</p>
        </div>
        <div className="px-3 py-1 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Systems Online</span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm group hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{user?.company?.name || '—'}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase">HQ Currency: {user?.company?.currencyCode || 'USD'}</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm group hover:border-purple-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Role</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5 capitalize">{user?.role || '—'}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.email}</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm group hover:border-emerald-200 transition-colors relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reimbursed</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-indigo-600">{user?.company?.currencySymbol || '$'}</span>
            <p className="text-lg font-bold text-slate-800">
              {stats?.totalApprovedAmount?.toLocaleString() || '0'}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-1 italic">{stats?.approvedCount || 0} expenses approved</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm group hover:border-amber-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Requests</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.pendingCount || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting approval</p>
        </div>
      </div>

      {/* Detailed stats or Recent Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold tracking-tight leading-none">Smart Reimbursements</h3>
                     <p className="text-xs text-indigo-300 mt-1">AI-powered fraud detection & OCR active.</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Avg. Decision Time</p>
                     <p className="text-2xl font-black">1.2 Days</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Policy Coverage</p>
                     <p className="text-2xl font-black">100%</p>
                  </div>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4 rounded-full" />
               </div>
               <p className="text-[10px] text-indigo-200 mt-3 font-medium">Compliance health is excellent for this quarter.</p>
            </div>
         </div>

         <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Shortcuts</h3>
            <div className="space-y-2">
               <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                     <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">New Expense</span>
               </button>
               <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                     <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Edit Profile</span>
               </button>
               <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                     <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Workspace Docs</span>
               </button>
            </div>
         </div>
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
    { id: 'overview',  label: 'Overview',           icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'expenses',  label: 'My Expenses',        icon: Receipt,         roles: ['admin', 'manager', 'employee'] },
    { id: 'approvals', label: 'Pending Approvals',  icon: ClipboardCheck,  roles: ['admin', 'manager'] },
    { id: 'team',      label: 'Team Members',       icon: Users,           roles: ['admin', 'manager'] },
    { id: 'rules',     label: 'Approval Rules',     icon: ShieldCheck,     roles: ['admin'] },
    { id: 'analytics', label: 'Analytics',          icon: BarChart3,       roles: ['admin', 'manager'] },
    { id: 'profile',   label: 'My Profile',         icon: User,            roles: ['admin', 'manager', 'employee'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(user.role));

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
        {visibleNavItems.map(({ id, label, icon }) => (
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
              {visibleNavItems.find((n) => n.id === section)?.label || 'Dashboard'}
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
          {section === 'overview'  && <OverviewPanel user={user} />}
          {section === 'expenses'  && <ExpensesPanel />}
          {section === 'approvals' && (user.role === 'admin' || user.role === 'manager') && <ApprovalsPanel />}
          {section === 'team'      && (user.role === 'admin' || user.role === 'manager') && <TeamPanel currentUserId={user.id} />}
          {section === 'rules'     && user.role === 'admin' && <RulesPanel />}
          {section === 'analytics' && (user.role === 'admin' || user.role === 'manager') && <AnalyticsPanel />}
          {section === 'profile'   && <ProfilePanel />}
        </main>
      </div>
    </div>
  );
}
