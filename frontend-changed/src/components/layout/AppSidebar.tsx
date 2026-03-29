import { useAuth, UserRole } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Send, FileText, CheckSquare, Users, GitBranch,
  ShieldCheck, Receipt, ChevronLeft, LogOut, UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
  employee: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Submit Expense", url: "/submit-expense", icon: Send },
    { title: "My Expenses", url: "/my-expenses", icon: FileText },
  ],
  manager: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Approvals", url: "/approvals", icon: CheckSquare },
    { title: "Team Expenses", url: "/team-expenses", icon: UsersRound },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/users", icon: Users },
    { title: "Workflows", url: "/workflows", icon: GitBranch },
    { title: "Approval Rules", url: "/approval-rules", icon: ShieldCheck },
    { title: "All Expenses", url: "/all-expenses", icon: Receipt },
  ],
};

export function AppSidebar() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;
  const items = navByRole[user.role];

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">
          E
        </div>
        {!collapsed && <span className="font-semibold text-sidebar-accent-foreground text-lg">Expensio</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>


      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button onClick={logout} className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
          collapsed && "justify-center px-0"
        )}>
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronLeft className={cn("h-3 w-3 text-foreground transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
