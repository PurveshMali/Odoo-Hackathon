import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  { icon: Zap, title: "Fast Submissions", desc: "Submit expenses in seconds with smart receipt capture and auto-categorization." },
  { icon: CheckCircle2, title: "Seamless Approvals", desc: "Multi-level approval workflows that keep your team moving without bottlenecks." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Track spending trends, budgets, and reimbursement status at a glance." },
  { icon: Shield, title: "Policy Compliance", desc: "Automated rule enforcement ensures every expense meets company policy." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">E</div>
            <span className="text-lg font-bold">Expensio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Zap className="h-3 w-3" /> Modern Expense Management
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-3xl mx-auto">
            Expense management
            <span className="text-primary"> made effortless</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Submit, approve, and track reimbursements with a streamlined workflow that saves your team hours every week.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors text-sm">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "10k+", label: "Expenses Processed" },
              { value: "98%", label: "Approval Rate" },
              { value: "2min", label: "Avg. Processing" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Everything you need to manage expenses</h2>
          <p className="text-muted-foreground text-center mt-3 max-w-lg mx-auto">From submission to reimbursement, Expensio covers the entire workflow.</p>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Built for every role</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { role: "Employee", desc: "Submit expenses quickly, attach receipts, and track reimbursement status in real time.", color: "bg-emerald-500/10 text-emerald-600" },
              { role: "Manager", desc: "Review and approve team expenses with one click. See spending breakdowns by category.", color: "bg-blue-500/10 text-blue-600" },
              { role: "Admin", desc: "Configure workflows, set approval rules, manage users, and oversee all company expenses.", color: "bg-violet-500/10 text-violet-600" },
            ].map((r) => (
              <div key={r.role} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-4 ${r.color}`}>{r.role}</div>
                <p className="text-muted-foreground text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">Ready to simplify your expenses?</h2>
          <p className="text-primary-foreground/70 mt-3 max-w-md mx-auto">Join thousands of teams already using Expensio to streamline reimbursements.</p>
          <Link to="/signup" className="mt-6 inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">E</div>
            <span className="text-sm font-semibold">Expensio</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Expensio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
