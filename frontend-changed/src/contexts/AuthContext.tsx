import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatar?: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (company: string, country: string, email: string, password: string, role: UserRole, name: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "expensio_users";
const SESSION_KEY = "expensio_session";

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed demo users on first load
function seedDemoUsers() {
  const users = getStoredUsers();
  if (users.length === 0) {
    const demo: StoredUser[] = [
      { id: "1", name: "Sarah Chen", email: "admin@acme.co", role: "admin", company: "Acme Corp", password: "demo" },
      { id: "2", name: "James Wilson", email: "manager@acme.co", role: "manager", company: "Acme Corp", password: "demo" },
      { id: "3", name: "Alex Rivera", email: "alex@acme.co", role: "employee", company: "Acme Corp", password: "demo" },
    ];
    saveUsers(demo);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Clear stale sessions from old app name
    localStorage.removeItem("reimburse_users");
    localStorage.removeItem("reimburse_session");
    seedDemoUsers();
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        // Validate session against stored users
        const users = getStoredUsers();
        const valid = users.find(u => u.id === parsed.id && u.email === parsed.email);
        if (valid) setUser(parsed);
        else localStorage.removeItem(SESSION_KEY);
      } catch { localStorage.removeItem(SESSION_KEY); }
    }
  }, []);

  const persistSession = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const login = (email: string, password: string): boolean => {
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      persistSession(userData);
      toast({ title: "Welcome back!", description: `Logged in as ${found.name} (${found.role})` });
      return true;
    }
    toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
    return false;
  };

  const signup = (company: string, _country: string, email: string, password: string, role: UserRole, name: string): boolean => {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ title: "Signup failed", description: "Email already registered", variant: "destructive" });
      return false;
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), name, email, role, company, password };
    saveUsers([...users, newUser]);
    const { password: _, ...userData } = newUser;
    persistSession(userData);
    toast({ title: "Account created!", description: `Welcome, ${name}! You're signed in as ${role}.` });
    return true;
  };

  const logout = () => {
    persistSession(null);
    toast({ title: "Logged out" });
  };

  const switchRole = (role: UserRole) => {
    const users = getStoredUsers();
    const demoUser = users.find(u => u.role === role);
    if (demoUser) {
      const { password: _, ...userData } = demoUser;
      persistSession(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
