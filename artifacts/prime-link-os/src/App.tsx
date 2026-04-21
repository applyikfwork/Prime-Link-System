import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";

import HomePage from "@/pages/home";
import AdminLoginPage from "@/pages/admin-login";
import EmployeeLoginPage from "@/pages/employee-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEmployees from "@/pages/admin/employees";
import AdminClients from "@/pages/admin/clients";
import AdminTasks from "@/pages/admin/tasks";
import AdminEarnings from "@/pages/admin/earnings";
import AdminPlans from "@/pages/admin/plans";
import AdminPages from "@/pages/admin/pages";
import AdminSettings from "@/pages/admin/settings";
import AdminAuditRequests from "@/pages/admin/audit-requests";
import PageView from "@/pages/page-view";
import { SiteHead } from "@/components/site-head";
import ChatPage from "@/pages/shared/chat";
import SalesmanDashboard from "@/pages/salesman/dashboard";
import AddClientPage from "@/pages/salesman/add-client";
import SalesmanEarnings from "@/pages/salesman/earnings";
import WorkerDashboard from "@/pages/worker/dashboard";
import WorkerTasks from "@/pages/worker/tasks";
import WorkerEarnings from "@/pages/worker/earnings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">Loading...</div>;
  if (!user) return <Redirect to="/Admin.primelink.sec.mang.dash" />;
  if (user.role !== "admin") return <Redirect to="/" />;
  return <AppLayout><Component /></AppLayout>;
}

function ProtectedSalesmanRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">Loading...</div>;
  if (!user) return <Redirect to="/Prime.link.emp.sec.dash.work" />;
  if (user.role !== "salesman" && user.role !== "admin") return <Redirect to="/" />;
  return <AppLayout><Component /></AppLayout>;
}

function ProtectedWorkerRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">Loading...</div>;
  if (!user) return <Redirect to="/Prime.link.emp.sec.dash.work" />;
  if (user.role !== "worker" && user.role !== "admin") return <Redirect to="/" />;
  return <AppLayout><Component /></AppLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/pages/:slug" component={PageView} />

      {/* Hidden login routes */}
      <Route path="/Admin.primelink.sec.mang.dash" component={AdminLoginPage} />
      <Route path="/Prime.link.emp.sec.dash.work" component={EmployeeLoginPage} />

      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedAdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/employees">
        <ProtectedAdminRoute component={AdminEmployees} />
      </Route>
      <Route path="/admin/clients">
        <ProtectedAdminRoute component={AdminClients} />
      </Route>
      <Route path="/admin/tasks">
        <ProtectedAdminRoute component={AdminTasks} />
      </Route>
      <Route path="/admin/earnings">
        <ProtectedAdminRoute component={AdminEarnings} />
      </Route>
      <Route path="/admin/plans">
        <ProtectedAdminRoute component={AdminPlans} />
      </Route>
      <Route path="/admin/pages">
        <ProtectedAdminRoute component={AdminPages} />
      </Route>
      <Route path="/admin/audit-requests">
        <ProtectedAdminRoute component={AdminAuditRequests} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedAdminRoute component={AdminSettings} />
      </Route>
      <Route path="/admin/chat">
        <ProtectedAdminRoute component={ChatPage} />
      </Route>

      {/* Salesman routes */}
      <Route path="/salesman">
        <ProtectedSalesmanRoute component={SalesmanDashboard} />
      </Route>
      <Route path="/salesman/add-client">
        <ProtectedSalesmanRoute component={AddClientPage} />
      </Route>
      <Route path="/salesman/earnings">
        <ProtectedSalesmanRoute component={SalesmanEarnings} />
      </Route>
      <Route path="/salesman/chat">
        <ProtectedSalesmanRoute component={ChatPage} />
      </Route>

      {/* Worker routes */}
      <Route path="/worker">
        <ProtectedWorkerRoute component={WorkerDashboard} />
      </Route>
      <Route path="/worker/tasks">
        <ProtectedWorkerRoute component={WorkerTasks} />
      </Route>
      <Route path="/worker/earnings">
        <ProtectedWorkerRoute component={WorkerEarnings} />
      </Route>
      <Route path="/worker/chat">
        <ProtectedWorkerRoute component={ChatPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <SiteHead />
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
