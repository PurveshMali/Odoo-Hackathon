import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { categories, currencies } from "@/data/mockData";
import { Upload, Sparkles, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function SubmitExpensePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addExpense } = useData();
  const [form, setForm] = useState({ amount: "", currency: "USD", category: "", date: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      employeeName: user?.name || "Unknown",
      employeeId: user?.id || "0",
      amount: parseFloat(form.amount),
      currency: form.currency,
      category: form.category,
      date: form.date,
      description: form.description,
    });
    toast({ title: "Expense Submitted", description: "Your expense has been submitted for approval." });
    setForm({ amount: "", currency: "USD", category: "", date: "", description: "" });
  };

  const handleOCR = () => {
    setForm({
      amount: "127.50",
      currency: "USD",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      description: "Business lunch at Downtown Restaurant",
    });
    toast({ title: "OCR Complete", description: "Receipt data has been auto-filled." });
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submit Expense</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details for your expense claim</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your expense..." rows={3} className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Upload Receipt</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop your receipt here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleOCR} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
              <Sparkles className="h-4 w-4" /> Auto-fill using OCR
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Send className="h-4 w-4" /> Submit Expense
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
