import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Briefcase, Shield } from "lucide-react";
import { countries } from "@/data/mockData";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "employee", label: "Employee", desc: "Submit & track expenses", icon: User },
  { value: "manager", label: "Manager", desc: "Approve team expenses", icon: Briefcase },
  { value: "admin", label: "Admin", desc: "Full system access", icon: Shield },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = signup(company, country, email, password, role, name);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">E</div>
          <span className="text-foreground text-xl font-semibold">Expensio</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-muted-foreground mt-1 mb-6">Start managing your company's expenses</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select your role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center",
                    role === r.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <r.icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{r.label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
              <option value="">Select country</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Create Account <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
