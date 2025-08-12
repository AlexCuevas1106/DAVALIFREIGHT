
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Dashboard from "@/pages/dashboard-simple";
import Documents from "@/pages/documents";
import ExpensesReport from "@/pages/expenses-report";
import Routes from "@/pages/routes";
import HoursOfService from "@/pages/hours-of-service";
import Vehicles from "@/pages/vehicles";
import DrivingTeam from "@/pages/driving-team";
import Inspection from "@/pages/inspection";
import InspectionHistory from "@/pages/inspection-history";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "user:", user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Sidebar />}
        <Switch>
          <Route path="/login">
            <AuthRoute>
              <Login />
            </AuthRoute>
          </Route>
          
          <Route path="/">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/documents">
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          </Route>
          
          <Route path="/expenses-report">
            <ProtectedRoute>
              <ExpensesReport />
            </ProtectedRoute>
          </Route>
          
          <Route path="/routes">
            <ProtectedRoute>
              <Routes />
            </ProtectedRoute>
          </Route>
          
          <Route path="/inspection">
            <ProtectedRoute>
              <Inspection />
            </ProtectedRoute>
          </Route>
          
          <Route path="/inspection-history">
            <ProtectedRoute>
              <InspectionHistory />
            </ProtectedRoute>
          </Route>

          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/hours-of-service">
            <ProtectedRoute>
              <HoursOfService />
            </ProtectedRoute>
          </Route>

          <Route path="/vehicles">
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          </Route>

          <Route path="/driving-team">
            <ProtectedRoute>
              <DrivingTeam />
            </ProtectedRoute>
          </Route>
          
          <Route>
            <NotFound />
          </Route>
        </Switch>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
