import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Expense, TeamMember, ApprovalRule, WorkflowStep,
  expenses as initialExpenses,
  teamMembers as initialTeamMembers,
  approvalRules as initialApprovalRules,
  notifications as initialNotifications,
} from "@/data/mockData";

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface DataContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "comments" | "approvalTimeline" | "status" | "convertedAmount">) => void;
  approveExpense: (id: string, approverName: string) => void;
  rejectExpense: (id: string, approverName: string) => void;
  addComment: (expenseId: string, author: string, text: string) => void;

  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, "id">) => void;
  deleteTeamMember: (id: string) => void;

  workflows: Workflow[];
  addWorkflow: (name: string, steps: WorkflowStep[]) => void;
  deleteWorkflow: (id: string) => void;

  approvalRules: ApprovalRule[];
  addApprovalRule: (rule: Omit<ApprovalRule, "id">) => void;
  deleteApprovalRule: (id: string) => void;

  notifications: Notification[];
  markNotificationRead: (id: number) => void;
  addNotification: (text: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const initialWorkflows: Workflow[] = [
  { id: "WF-1", name: "Standard Approval", steps: [{ name: "Manager Review", approverRole: "Manager", order: 1 }, { name: "Finance Review", approverRole: "Finance", order: 2 }] },
  { id: "WF-2", name: "Quick Approval", steps: [{ name: "Manager Review", approverRole: "Manager", order: 1 }] },
];

let expenseCounter = 7;
let memberCounter = 7;
let workflowCounter = 3;
let ruleCounter = 4;
let notifCounter = 5;

export function DataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(initialApprovalRules);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = (text: string) => {
    setNotifications(prev => [{ id: notifCounter++, text, time: "Just now", read: false }, ...prev]);
  };

  const addExpense = (expense: Omit<Expense, "id" | "comments" | "approvalTimeline" | "status" | "convertedAmount">) => {
    const id = `EXP-${String(expenseCounter++).padStart(3, "0")}`;
    const newExpense: Expense = {
      ...expense,
      id,
      status: "pending",
      convertedAmount: expense.amount,
      comments: [],
      approvalTimeline: [
        { step: "Manager Review", approver: "James Wilson", status: "pending" },
        { step: "Finance Review", approver: "Sarah Chen", status: "pending" },
      ],
    };
    setExpenses(prev => [newExpense, ...prev]);
    addNotification(`New expense ${id} submitted by ${expense.employeeName}`);
  };

  const approveExpense = (id: string, approverName: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const timeline = [...e.approvalTimeline];
      const firstPendingIdx = timeline.findIndex(s => s.status === "pending");
      if (firstPendingIdx !== -1) {
        timeline[firstPendingIdx] = { ...timeline[firstPendingIdx], status: "approved", date: new Date().toISOString().split("T")[0] };
      }
      const allApproved = timeline.every(s => s.status === "approved");
      return { ...e, approvalTimeline: timeline, status: allApproved ? "approved" as const : e.status };
    }));
    addNotification(`Expense ${id} approved by ${approverName}`);
  };

  const rejectExpense = (id: string, approverName: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const timeline = [...e.approvalTimeline];
      const firstPendingIdx = timeline.findIndex(s => s.status === "pending");
      if (firstPendingIdx !== -1) {
        timeline[firstPendingIdx] = { ...timeline[firstPendingIdx], status: "rejected", date: new Date().toISOString().split("T")[0] };
      }
      return { ...e, approvalTimeline: timeline, status: "rejected" as const };
    }));
    addNotification(`Expense ${id} rejected by ${approverName}`);
  };

  const addComment = (expenseId: string, author: string, text: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== expenseId) return e;
      return { ...e, comments: [...e.comments, { author, text, date: new Date().toISOString().split("T")[0] }] };
    }));
  };

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    setTeamMembers(prev => [...prev, { ...member, id: String(memberCounter++) }]);
    addNotification(`New user ${member.name} added`);
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const addWorkflow = (name: string, steps: WorkflowStep[]) => {
    setWorkflows(prev => [...prev, { id: `WF-${workflowCounter++}`, name, steps }]);
    addNotification(`Workflow "${name}" created`);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const addApprovalRule = (rule: Omit<ApprovalRule, "id">) => {
    setApprovalRules(prev => [...prev, { ...rule, id: `R-${String(ruleCounter++).padStart(3, "0")}` }]);
    addNotification(`Approval rule "${rule.name}" created`);
  };

  const deleteApprovalRule = (id: string) => {
    setApprovalRules(prev => prev.filter(r => r.id !== id));
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <DataContext.Provider value={{
      expenses, addExpense, approveExpense, rejectExpense, addComment,
      teamMembers, addTeamMember, deleteTeamMember,
      workflows, addWorkflow, deleteWorkflow,
      approvalRules, addApprovalRule, deleteApprovalRule,
      notifications, markNotificationRead, addNotification,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
