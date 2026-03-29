import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Plus, GripVertical, Trash2, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowStep } from "@/data/mockData";

export default function WorkflowsPage() {
  const { toast } = useToast();
  const { workflows, addWorkflow, deleteWorkflow } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSteps, setNewSteps] = useState<WorkflowStep[]>([{ name: "", approverRole: "", order: 1 }]);

  const addStep = () => setNewSteps([...newSteps, { name: "", approverRole: "", order: newSteps.length + 1 }]);
  const removeStep = (i: number) => setNewSteps(newSteps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof WorkflowStep, val: string) => {
    const updated = [...newSteps];
    (updated[i] as any)[field] = val;
    setNewSteps(updated);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast({ title: "Error", description: "Workflow name is required.", variant: "destructive" });
      return;
    }
    addWorkflow(newName, newSteps);
    toast({ title: "Workflow Created", description: `${newName} workflow has been saved.` });
    setShowCreate(false);
    setNewName("");
    setNewSteps([{ name: "", approverRole: "", order: 1 }]);
  };

  const handleDelete = (id: string) => {
    deleteWorkflow(id);
    toast({ title: "Workflow Deleted", description: "Workflow has been removed." });
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
            <p className="text-muted-foreground text-sm mt-1">Create multi-step approval flows</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Workflow
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="bg-card rounded-xl border border-border shadow-sm p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{wf.name}</h3>
                </div>
                <button onClick={() => handleDelete(wf.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {wf.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5">
                    <span className="text-xs font-bold text-muted-foreground w-6">{step.order}.</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.approverRole}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-6">Create Workflow</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Workflow Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Standard Approval" className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Steps</label>
                  <div className="space-y-3">
                    {newSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 bg-muted rounded-lg p-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <input type="text" value={step.name} onChange={(e) => updateStep(i, "name", e.target.value)} placeholder="Step name" className={inputClass} />
                          <input type="text" value={step.approverRole} onChange={(e) => updateStep(i, "approverRole", e.target.value)} placeholder="Approver role/user" className={inputClass} />
                        </div>
                        {newSteps.length > 1 && (
                          <button onClick={() => removeStep(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors mt-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addStep} className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Step
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Create Workflow</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
