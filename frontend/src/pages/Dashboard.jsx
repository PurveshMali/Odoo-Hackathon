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
    className={`w-full flex items-center gap-[8px] px-[8px] h-[36px] rounded-[6px] text-[13px] font-sans transition-none group
      ${active
        ? 'bg-sidebar-active text-white font-medium'
        : 'text-sidebar-muted hover:bg-[#222222] hover:text-sidebar-text'
      }`
    }
  >
    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-sidebar-muted group-hover:text-sidebar-text'}`} />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className={`text-[11px] font-mono px-[6px] py-[2px] rounded-[4px]
        ${active ? 'bg-white/10 text-white' : 'bg-[#222222] text-sidebar-muted'}`}
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

  return (
    <div className="space-y-[24px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.01em] text-primary">
            Overview
          </h1>
          <p className="text-[13px] text-secondary mt-1">Here's an overview of your workspace.</p>
        </div>
        <div className="px-[8px] py-[4px] bg-page border border-border-default rounded-[4px] flex items-center gap-[6px]">
           <div className="w-[6px] h-[6px] rounded-[2px] bg-success" />
           <span className="text-[11px] font-mono font-medium text-secondary uppercase tracking-[0.03em] leading-none mt-0.5">Systems Online</span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <div className="bg-surface border border-border-default rounded-[6px] p-[24px] border-l-2 border-l-accent flex flex-col justify-end min-h-[100px]">
          <p className="text-[24px] font-mono text-primary leading-none">{user?.company?.name || '—'}</p>
          <p className="text-[12px] text-muted mt-[8px]">Workspace</p>
        </div>

        <div className="bg-surface border border-border-default rounded-[6px] p-[24px] border-l-2 border-l-accent flex flex-col justify-end min-h-[100px]">
          <p className="text-[24px] font-mono text-primary leading-none capitalize">{user?.role || '—'}</p>
          <p className="text-[12px] text-muted mt-[8px]">Role Status</p>
        </div>

        <div className="bg-surface border border-border-default rounded-[6px] p-[24px] border-l-2 border-l-accent flex flex-col justify-end min-h-[100px]">
          <p className="text-[24px] font-mono text-primary leading-none">
            {stats?.totalApprovedAmount?.toLocaleString() || '0'}
          </p>
          <p className="text-[12px] text-muted mt-[8px]">Reimbursed ({user?.company?.currencyCode || 'USD'})</p>
        </div>

        <div className="bg-surface border border-border-default rounded-[6px] p-[24px] border-l-2 border-l-accent flex flex-col justify-end min-h-[100px]">
          <p className="text-[24px] font-mono text-primary leading-none">{stats?.pendingCount || 0}</p>
          <p className="text-[12px] text-muted mt-[8px]">Pending Requests</p>
        </div>
      </div>

      {/* Detailed stats or Recent Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
         <div className="lg:col-span-2 bg-surface border border-border-default rounded-[6px] p-[24px]">
            <h3 className="text-[18px] font-medium text-primary mb-[24px] tracking-[-0.01em]">Compliance Health</h3>
            <div className="grid grid-cols-2 gap-[24px] border-b border-border-default pb-[24px] mb-[24px]">
               <div className="space-y-[4px]">
                  <p className="text-[11px] font-mono text-secondary uppercase tracking-[0.03em]">Avg. Decision Time</p>
                  <p className="text-[24px] font-mono text-primary">1.2 Days</p>
               </div>
               <div className="space-y-[4px]">
                  <p className="text-[11px] font-mono text-secondary uppercase tracking-[0.03em]">Policy Coverage</p>
                  <p className="text-[24px] font-mono text-primary">100%</p>
               </div>
            </div>
            <p className="text-[13px] text-secondary">AI-powered fraud detection & OCR active. Compliance health is excellent for this quarter.</p>
         </div>

         <div className="bg-surface border border-border-default rounded-[6px] p-[24px]">
            <h3 className="text-[18px] font-medium text-primary mb-[24px] tracking-[-0.01em]">Quick Shortcuts</h3>
            <div className="space-y-[8px]">
               <button className="w-full flex items-center justify-between p-[12px] bg-page border border-border-default hover:bg-surface hover:border-border-hover rounded-[6px] transition-none group">
                  <span className="text-[13px] text-primary">New Expense</span>
                  <span className="text-[11px] font-mono text-muted group-hover:text-primary">→</span>
               </button>
               <button className="w-full flex items-center justify-between p-[12px] bg-page border border-border-default hover:bg-surface hover:border-border-hover rounded-[6px] transition-none group">
                  <span className="text-[13px] text-primary">Edit Profile</span>
                  <span className="text-[11px] font-mono text-muted group-hover:text-primary">→</span>
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
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="px-[24px] py-[24px]">
        <div className="flex items-center gap-[8px]">
          <div className="w-[16px] h-[16px] bg-sidebar-text rounded-[2px]" />
          <p className="font-medium text-sidebar-text text-[14px] leading-none">Expensio</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-[16px] py-[8px]">
         <p className="text-[10px] font-mono uppercase tracking-[0.03em] text-sidebar-muted mb-[8px] px-[8px] bg-transparent">Main Menu</p>
         <nav className="space-y-[2px]">
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
      </div>

      <div className="flex-1" />

      {/* User section */}
      <div className="p-[16px]">
        <div className="flex items-center gap-[12px] px-[8px] py-[8px] mb-[8px]">
          <div className="w-[24px] h-[24px] rounded-[4px] bg-[#222222] text-sidebar-muted flex items-center justify-center font-mono text-[11px] uppercase shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-sidebar-text truncate">{user?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-[8px] px-[8px] h-[32px] rounded-[4px] text-[13px] font-sans text-sidebar-muted hover:bg-[#222222] hover:text-sidebar-text transition-none"
        >
          <LogOut className="w-[14px] h-[14px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-sidebar border-r border-[#222222]">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[220px] bg-sidebar z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-surface border-b border-border-default px-[40px] py-[16px] flex items-center gap-[12px] shrink-0 h-[64px]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-[4px] text-secondary hover:text-primary transition-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-medium text-primary text-[14px]">
              {visibleNavItems.find((n) => n.id === section)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {user?.mustChangePassword && (
              <span className="hidden sm:inline-flex items-center px-[8px] py-[4px] text-[11px] font-mono uppercase bg-[#FEF9EC] text-[#92400E] rounded-[4px]">
                Password change required
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-[40px] pt-[32px] pb-[64px]">
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
