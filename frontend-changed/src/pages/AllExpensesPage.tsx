import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExpenseDetailModal } from "@/components/shared/ExpenseDetailModal";
import { useData } from "@/contexts/DataContext";
import { Expense } from "@/data/mockData";

export default function AllExpensesPage() {
  const { expenses } = useData();
  const [selected, setSelected] = useState<Expense | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const employees = [...new Set(expenses.map((e) => e.employeeName))];
  const filtered = expenses
    .filter((e) => statusFilter === "all" || e.status === statusFilter)
    .filter((e) => employeeFilter === "all" || e.employeeName === employeeFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Expenses</h1>
            <p className="text-muted-foreground text-sm mt-1">Company-wide expense records</p>
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Employees</option>
              {employees.map((emp) => <option key={emp} value={emp}>{emp}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground">{e.id}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.employeeName}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium">${e.convertedAmount.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.date}</td>
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
    </DashboardLayout>
  );
}
