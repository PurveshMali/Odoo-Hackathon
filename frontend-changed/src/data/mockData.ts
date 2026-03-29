export interface Expense {
  id: string;
  employeeName: string;
  employeeId: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  category: string;
  date: string;
  description: string;
  status: "approved" | "rejected" | "pending";
  receipt?: string;
  comments: { author: string; text: string; date: string }[];
  approvalTimeline: { step: string; approver: string; status: "approved" | "pending" | "rejected"; date?: string }[];
}

export interface WorkflowStep {
  name: string;
  approverRole: string;
  order: number;
}

export interface ApprovalRule {
  id: string;
  name: string;
  type: "percentage" | "specific" | "hybrid";
  percentage?: number;
  specialApprover?: string;
  overrideEnabled: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager";
  manager?: string;
  department: string;
}

export const expenses: Expense[] = [
  {
    id: "EXP-001", employeeName: "Alex Rivera", employeeId: "3", amount: 245.50, currency: "USD",
    convertedAmount: 245.50, category: "Travel", date: "2026-03-25", description: "Uber rides for client meetings",
    status: "approved", comments: [{ author: "James Wilson", text: "Approved - valid business travel", date: "2026-03-26" }],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "approved", date: "2026-03-26" },
      { step: "Finance Review", approver: "Sarah Chen", status: "approved", date: "2026-03-27" },
    ],
  },
  {
    id: "EXP-002", employeeName: "Alex Rivera", employeeId: "3", amount: 89.99, currency: "USD",
    convertedAmount: 89.99, category: "Office", date: "2026-03-24", description: "Ergonomic keyboard",
    status: "pending", comments: [],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "pending" },
      { step: "Finance Review", approver: "Sarah Chen", status: "pending" },
    ],
  },
  {
    id: "EXP-003", employeeName: "Alex Rivera", employeeId: "3", amount: 32.00, currency: "USD",
    convertedAmount: 32.00, category: "Food", date: "2026-03-22", description: "Team lunch",
    status: "rejected", comments: [{ author: "James Wilson", text: "Missing receipt", date: "2026-03-23" }],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "rejected", date: "2026-03-23" },
    ],
  },
  {
    id: "EXP-004", employeeName: "Maria Santos", employeeId: "4", amount: 1250.00, currency: "EUR",
    convertedAmount: 1375.00, category: "Travel", date: "2026-03-20", description: "Flight to Berlin conference",
    status: "pending", comments: [],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "approved", date: "2026-03-21" },
      { step: "Finance Review", approver: "Sarah Chen", status: "pending" },
    ],
  },
  {
    id: "EXP-005", employeeName: "Tom Baker", employeeId: "5", amount: 55.00, currency: "USD",
    convertedAmount: 55.00, category: "Software", date: "2026-03-19", description: "Monthly Figma subscription",
    status: "approved", comments: [{ author: "James Wilson", text: "Recurring approved", date: "2026-03-19" }],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "approved", date: "2026-03-19" },
    ],
  },
  {
    id: "EXP-006", employeeName: "Maria Santos", employeeId: "4", amount: 178.50, currency: "USD",
    convertedAmount: 178.50, category: "Food", date: "2026-03-18", description: "Client dinner",
    status: "approved", comments: [],
    approvalTimeline: [
      { step: "Manager Review", approver: "James Wilson", status: "approved", date: "2026-03-18" },
    ],
  },
];

export const teamMembers: TeamMember[] = [
  { id: "3", name: "Alex Rivera", email: "alex@acme.co", role: "employee", manager: "James Wilson", department: "Engineering" },
  { id: "4", name: "Maria Santos", email: "maria@acme.co", role: "employee", manager: "James Wilson", department: "Design" },
  { id: "5", name: "Tom Baker", email: "tom@acme.co", role: "employee", manager: "James Wilson", department: "Engineering" },
  { id: "6", name: "Lisa Park", email: "lisa@acme.co", role: "manager", department: "Marketing" },
];

export const approvalRules: ApprovalRule[] = [
  { id: "R-001", name: "Standard Approval", type: "percentage", percentage: 100, overrideEnabled: false },
  { id: "R-002", name: "High Value", type: "specific", specialApprover: "CFO", overrideEnabled: true },
  { id: "R-003", name: "Travel Policy", type: "hybrid", percentage: 50, specialApprover: "VP Finance", overrideEnabled: false },
];

export const notifications = [
  { id: 1, text: "New expense submitted by Alex Rivera", time: "2 min ago", read: false },
  { id: 2, text: "Expense EXP-004 approved by James Wilson", time: "1 hour ago", read: false },
  { id: 3, text: "Maria Santos submitted a travel expense", time: "3 hours ago", read: true },
  { id: 4, text: "Monthly report is ready", time: "1 day ago", read: true },
];

export const categories = ["Food", "Travel", "Office", "Software", "Equipment", "Entertainment", "Other"];
export const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"];
export const countries = ["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "India", "Japan", "Brazil"];
