import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitExpensePage from "./pages/SubmitExpensePage";
import MyExpensesPage from "./pages/MyExpensesPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import TeamExpensesPage from "./pages/TeamExpensesPage";
import UsersPage from "./pages/UsersPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import ApprovalRulesPage from "./pages/ApprovalRulesPage";
import AllExpensesPage from "./pages/AllExpensesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* Employee */}
      <Route path="/submit-expense" element={<SubmitExpensePage />} />
      <Route path="/my-expenses" element={<MyExpensesPage />} />
      {/* Manager */}
      <Route path="/approvals" element={<ApprovalsPage />} />
      <Route path="/team-expenses" element={<TeamExpensesPage />} />
      {/* Admin */}
      <Route path="/users" element={<UsersPage />} />
      <Route path="/workflows" element={<WorkflowsPage />} />
      <Route path="/approval-rules" element={<ApprovalRulesPage />} />
      <Route path="/all-expenses" element={<AllExpensesPage />} />
      <Route path="/signup" element={<Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
