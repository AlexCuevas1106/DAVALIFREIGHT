import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider, Sidebar } from "./components/ui/sidebar";
import { useAuth } from "./hooks/useAuth";

// Pages
import Dashboard from "./pages/dashboard-simple";
import Documents from "./pages/documents";
import ExpensesReport from "./pages/expenses-report";
import Routes from "./pages/routes";
import Inspection from "./pages/inspection";
import InspectionHistory from "./pages/inspection-history";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import VehiclesPage from "./pages/vehicles";
import AddTruckPage from "./pages/add-truck";
import AddCajaPage from "./pages/add-caja";
import DriversPage from "./pages/drivers";

import "./index.css";


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
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-white">
          {isAuthenticated && <Sidebar />}
          <main className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
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
              <Route path="/drivers">
                <ProtectedRoute>
                  <DriversPage />
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
              <Route path="/vehicles">
                <ProtectedRoute>
                  <VehiclesPage />
                </ProtectedRoute>
              </Route>
              <Route path="/vehicles/add-truck">
                <ProtectedRoute>
                  <AddTruckPage />
                </ProtectedRoute>
              </Route>
              <Route path="/vehicles/add-caja">
                <ProtectedRoute>
                  <AddCajaPage />
                </ProtectedRoute>
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
            <Toaster />
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
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
