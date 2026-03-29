import { Expense } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";
import { X, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseDetailModal({ expense, onClose }: ExpenseDetailModalProps) {
  if (!expense) return null;

  const stepIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="h-5 w-5 text-status-approved" />;
    if (status === "rejected") return <XCircle className="h-5 w-5 text-status-rejected" />;
    return <Clock className="h-5 w-5 text-status-pending" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{expense.id}</h2>
            <p className="text-sm text-muted-foreground">{expense.employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-foreground font-semibold">${expense.amount.toFixed(2)} {expense.currency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Converted</p>
              <p className="text-foreground font-semibold">${expense.convertedAmount.toFixed(2)} USD</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-foreground">{expense.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-foreground">{expense.date}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={expense.status} />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-foreground text-sm">{expense.description}</p>
            </div>
          </div>

          {/* Receipt preview placeholder */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Receipt</p>
            <div className="border border-border rounded-lg bg-muted h-32 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Receipt preview</p>
            </div>
          </div>

          {/* Approval Timeline */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Approval Timeline</p>
            <div className="space-y-3">
              {expense.approvalTimeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  {stepIcon(step.status)}
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{step.step}</p>
                    <p className="text-xs text-muted-foreground">{step.approver} {step.date ? `• ${step.date}` : ""}</p>
                  </div>
                  <StatusBadge status={step.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          {expense.comments.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Comments
              </p>
              <div className="space-y-2">
                {expense.comments.map((c, i) => (
                  <div key={i} className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-foreground">{c.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.author} • {c.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
