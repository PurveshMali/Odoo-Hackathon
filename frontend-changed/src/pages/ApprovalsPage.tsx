import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExpenseDetailModal } from "@/components/shared/ExpenseDetailModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Expense } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";

export default function ApprovalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { expenses, approveExpense, rejectExpense, addComment } = useData();
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const [selected, setSelected] = useState<Expense | null>(null);
  const [commentModal, setCommentModal] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const handleApprove = (id: string) => {
    approveExpense(id, user?.name || "Manager");
    toast({ title: "Approved", description: `Expense ${id} has been approved.` });
  };
  const handleReject = (id: string) => {
    rejectExpense(id, user?.name || "Manager");
    toast({ title: "Rejected", description: `Expense ${id} has been rejected.` });
  };
  const handleComment = () => {
    if (commentModal && comment.trim()) {
      addComment(commentModal, user?.name || "Manager", comment);
      toast({ title: "Comment Added", description: "Your comment has been saved." });
    }
    setCommentModal(null);
    setComment("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve team expense requests</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {pendingExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-8"><EmptyState title="No pending approvals" description="All caught up! No expenses waiting for review." /></td></tr>
                ) : pendingExpenses.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-foreground">{e.employeeName}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium">${e.convertedAmount.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.category}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.date}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(e.id)} className="p-1.5 rounded-md bg-status-approved-bg text-status-approved hover:opacity-80 transition-opacity" title="Approve">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleReject(e.id)} className="p-1.5 rounded-md bg-status-rejected-bg text-status-rejected hover:opacity-80 transition-opacity" title="Reject">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => setCommentModal(e.id)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:opacity-80 transition-opacity" title="Comment">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button onClick={() => setSelected(e)} className="text-primary text-sm hover:underline ml-1">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {commentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">Add Comment</h3>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Write your comment..." className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => { setCommentModal(null); setComment(""); }} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleComment} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save Comment</button>
              </div>
            </div>
          </div>
        )}

        <ExpenseDetailModal expense={selected} onClose={() => setSelected(null)} />
      </div>
    </DashboardLayout>
  );
}
