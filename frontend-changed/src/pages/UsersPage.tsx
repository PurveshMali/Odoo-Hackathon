import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Plus, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const { teamMembers, addTeamMember, deleteTeamMember } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "employee" as "employee" | "manager", manager: "", department: "" });

  const inputClass = "w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const handleCreate = () => {
    if (!newUser.name || !newUser.email) {
      toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    addTeamMember(newUser);
    toast({ title: "User Created", description: `${newUser.name} has been added.` });
    setShowCreate(false);
    setNewUser({ name: "", email: "", role: "employee", manager: "", department: "" });
  };

  const handleDelete = (id: string, name: string) => {
    deleteTeamMember(id);
    toast({ title: "User Removed", description: `${name} has been removed.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage employees and managers</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Manager</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {teamMembers.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-foreground font-medium">{m.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{m.email}</td>
                    <td className="px-5 py-3.5"><span className="capitalize text-foreground bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium">{m.role}</span></td>
                    <td className="px-5 py-3.5 text-foreground">{m.manager || "—"}</td>
                    <td className="px-5 py-3.5 text-foreground">{m.department}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleDelete(m.id, m.name)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Create User</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@company.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "employee" | "manager" })} className={inputClass}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Assign Manager</label>
                  <input type="text" value={newUser.manager} onChange={(e) => setNewUser({ ...newUser, manager: e.target.value })} placeholder="Manager name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                  <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} placeholder="Department" className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Create User</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
