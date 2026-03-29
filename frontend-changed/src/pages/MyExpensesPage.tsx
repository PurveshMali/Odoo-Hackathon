import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExpenseDetailModal } from "@/components/shared/ExpenseDetailModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Expense } from "@/data/mockData";

export default function MyExpensesPage() {
  const { user } = useAuth();
  const { expenses } = useData();
  const myExpenses = expenses.filter((e) => e.employeeId === user?.id);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? myExpenses : myExpenses.filter((e) => e.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Expenses</h1>
            <p className="text-muted-foreground text-sm mt-1">Track all your submitted expenses</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8"><EmptyState title="No expenses found" description="Submit your first expense to get started." /></td></tr>
                ) : filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-foreground">{e.date}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium">${e.amount.toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(e)} className="text-primary text-sm hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ExpenseDetailModal expense={selected} onClose={() => setSelected(null)} />
      </div>
    </DashboardLayout>
  );
}
