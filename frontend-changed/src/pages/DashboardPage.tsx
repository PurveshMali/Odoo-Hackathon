import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExpenseDetailModal } from "@/components/shared/ExpenseDetailModal";
import { DollarSign, Clock, CheckCircle2, FileText, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Expense } from "@/data/mockData";

function EmployeeDashboard() {
  const { expenses } = useData();
  const myExpenses = expenses.filter((e) => e.employeeId === "3");
  const total = myExpenses.reduce((s, e) => s + e.amount, 0);
  const approved = myExpenses.filter((e) => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const pending = myExpenses.filter((e) => e.status === "pending").length;
  const [selected, setSelected] = useState<Expense | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your expenses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Submitted" value={`$${total.toFixed(2)}`} icon={DollarSign} trend="+12% this month" />
        <StatCard title="Approved Amount" value={`$${approved.toFixed(2)}`} icon={CheckCircle2} />
        <StatCard title="Pending Requests" value={pending} icon={Clock} />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Recent Expenses</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
            </tr></thead>
            <tbody>
              {myExpenses.slice(0, 5).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-foreground">{e.date}</td>
                  <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                  <td className="px-5 py-3.5 text-foreground font-medium">${e.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(e)} className="text-primary text-sm hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExpenseDetailModal expense={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ManagerDashboard() {
  const { expenses, teamMembers } = useData();
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const approvedToday = expenses.filter((e) => e.status === "approved").length;
  const [selected, setSelected] = useState<Expense | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve team expenses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Approvals" value={pendingExpenses.length} icon={Clock} />
        <StatCard title="Approved" value={approvedToday} icon={CheckCircle2} />
        <StatCard title="Team Members" value={teamMembers.length} icon={Users} />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Pending Requests</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
            </tr></thead>
            <tbody>
              {pendingExpenses.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-foreground">{e.employeeName}</td>
                  <td className="px-5 py-3.5 text-foreground font-medium">${e.convertedAmount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                  <td className="px-5 py-3.5 text-foreground">{e.date}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(e)} className="text-primary text-sm hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExpenseDetailModal expense={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AdminDashboard() {
  const { expenses } = useData();
  const total = expenses.reduce((s, e) => s + e.convertedAmount, 0);
  const pending = expenses.filter((e) => e.status === "pending").length;
  const approved = expenses.filter((e) => e.status === "approved").length;
  const [selected, setSelected] = useState<Expense | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Company-wide expense overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Expenses" value={`$${total.toFixed(2)}`} icon={DollarSign} trend="+8% vs last month" />
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved" value={approved} icon={CheckCircle2} />
        <StatCard title="Total Requests" value={expenses.length} icon={FileText} />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Recent Activity</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
            </tr></thead>
            <tbody>
              {expenses.slice(0, 5).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground">{e.id}</td>
                  <td className="px-5 py-3.5 text-foreground">{e.employeeName}</td>
                  <td className="px-5 py-3.5 text-foreground font-medium">${e.convertedAmount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(e)} className="text-primary text-sm hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExpenseDetailModal expense={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      {user?.role === "employee" && <EmployeeDashboard />}
      {user?.role === "manager" && <ManagerDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
    </DashboardLayout>
  );
}
