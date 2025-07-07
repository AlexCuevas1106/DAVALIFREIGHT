import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import ExpensesReport from "@/pages/expenses-report";
import Documents from "@/pages/documents";
import Routes from "@/pages/routes";
import InspectionPage from "@/pages/inspection";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/expenses-report" component={ExpensesReport} />
          <Route path="/documents" component={Documents} />
          <Route path="/routes" component={Routes} />
          <Route path="/inspection" component={InspectionPage} />
          {/* Routes only for administrators */}
          {isAdmin && (
            <>
              <Route path="/vehicles" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Vehicles (Coming Soon)</h1></div>} />
              <Route path="/drivers" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Drivers (Coming Soon)</h1></div>} />
              <Route path="/shipments" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Shipments (Coming Soon)</h1></div>} />
              <Route path="/reports" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Reports (Coming Soon)</h1></div>} />
              <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Settings (Coming Soon)</h1></div>} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;