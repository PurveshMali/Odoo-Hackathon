import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) navigate("/dashboard");
  };

  const quickLogin = (demoEmail: string) => {
    const success = login(demoEmail, "demo");
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-lg">E</div>
            <span className="text-primary-foreground text-xl font-semibold">Expensio</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">Streamline your<br />expense management</h1>
          <p className="text-primary-foreground/70 mt-4 text-lg max-w-md">Submit, approve, and track reimbursements with a modern workflow that saves time.</p>
        </div>
        <div className="text-primary-foreground/40 text-sm">© 2026 Expensio. All rights reserved.</div>
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -right-10 -bottom-32 w-80 h-80 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">E</div>
            <span className="text-foreground text-xl font-semibold">Expensio</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="text-muted-foreground mt-1 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Create Account</Link>
          </p>

          <div className="mt-8 p-4 bg-accent rounded-lg">
            <p className="text-xs text-accent-foreground font-medium mb-2">Demo Quick Login:</p>
            <div className="flex gap-2">
              {[
                { label: "Admin", email: "admin@acme.co" },
                { label: "Manager", email: "manager@acme.co" },
                { label: "Employee", email: "alex@acme.co" },
              ].map((d) => (
                <button key={d.label} onClick={() => quickLogin(d.email)} className="text-xs px-3 py-1.5 bg-card border border-border rounded-md text-foreground hover:bg-muted transition-colors">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
