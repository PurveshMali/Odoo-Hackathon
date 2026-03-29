import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApprovalRulesPage() {
  const { toast } = useToast();
  const { approvalRules, addApprovalRule, deleteApprovalRule } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "percentage" as "percentage" | "specific" | "hybrid", percentage: "", specialApprover: "", override: false });

  const inputClass = "w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Rule name is required.", variant: "destructive" });
      return;
    }
    addApprovalRule({
      name: form.name,
      type: form.type,
      percentage: form.percentage ? Number(form.percentage) : undefined,
      specialApprover: form.specialApprover || undefined,
      overrideEnabled: form.override,
    });
    toast({ title: "Rule Created", description: `${form.name} has been saved.` });
    setShowCreate(false);
    setForm({ name: "", type: "percentage", percentage: "", specialApprover: "", override: false });
  };

  const handleDelete = (id: string) => {
    deleteApprovalRule(id);
    toast({ title: "Rule Deleted", description: "Approval rule has been removed." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Approval Rules</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure approval policies</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvalRules.map((rule) => (
            <div key={rule.id} className="bg-card rounded-xl border border-border shadow-sm p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{rule.name}</h3>
                </div>
                <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground capitalize font-medium">{rule.type}</span></div>
                {rule.percentage && <div className="flex justify-between"><span className="text-muted-foreground">Percentage</span><span className="text-foreground">{rule.percentage}%</span></div>}
                {rule.specialApprover && <div className="flex justify-between"><span className="text-muted-foreground">Approver</span><span className="text-foreground">{rule.specialApprover}</span></div>}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Override</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.overrideEnabled ? "bg-status-approved-bg text-status-approved" : "bg-muted text-muted-foreground"}`}>
                    {rule.overrideEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-6">Create Approval Rule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rule Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. High Value Approval" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rule Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={inputClass}>
                    <option value="percentage">Percentage</option>
                    <option value="specific">Specific Approver</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                {(form.type === "percentage" || form.type === "hybrid") && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Percentage</label>
                    <input type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} placeholder="100" className={inputClass} />
                  </div>
                )}
                {(form.type === "specific" || form.type === "hybrid") && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Special Approver</label>
                    <input type="text" value={form.specialApprover} onChange={(e) => setForm({ ...form, specialApprover: e.target.value })} placeholder="e.g. CFO" className={inputClass} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Override Approvals</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, override: !form.override })}
                    className={`w-11 h-6 rounded-full transition-colors ${form.override ? "bg-primary" : "bg-muted"} relative`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-card shadow-sm transition-transform absolute top-0.5 ${form.override ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Create Rule</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
