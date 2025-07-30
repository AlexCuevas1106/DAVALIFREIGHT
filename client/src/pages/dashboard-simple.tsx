import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeAnimation } from "@/components/welcome-animation";

interface DashboardData {
  driver: {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    dutyStartTime: string | null;
    currentVehicleId: number | null;
    currentTrailerId: number | null;
  };
  currentVehicle: any;
  currentTrailer: any;
  currentShipment: any;
  hos: any;
  pendingInspections: number;
  totalDocuments: number;
  recentActivities: any[];
  metrics: {
    onTimeDeliveries: number;
    fuelEfficiency: number;
    safetyScore: number;
    hosCompliance: number;
  };
}

export default function Dashboard() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(() => {
    // Check localStorage to see if we've shown welcome for this session
    return localStorage.getItem("hasShownWelcome") === "true";
  });

  // Show welcome animation when user first loads dashboard
  useEffect(() => {
    if (currentUser && !authLoading && !hasShownWelcome) {
      setShowWelcome(true);
      setHasShownWelcome(true);
      localStorage.setItem("hasShownWelcome", "true");
    }
  }, [currentUser, authLoading, hasShownWelcome]);
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error("No user ID available");
      }

      const response = await fetch(`/api/dashboard/${currentUser.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!currentUser?.id && !authLoading,
    retry: 1,
    staleTime: 30000,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No user found - please login</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  const { driver, metrics } = dashboardData;

  // Show welcome animation
  if (showWelcome) {
    return (
      <WelcomeAnimation 
        user={currentUser} 
        onComplete={() => setShowWelcome(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {driver.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                driver.status === 'off_duty' ? 'bg-gray-100 text-gray-800' :
                driver.status === 'on_duty' ? 'bg-green-100 text-green-800' :
                driver.status === 'driving' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {driver.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{driver.status}</div>
                <p className="text-xs text-muted-foreground">
                  Current duty status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.onTimeDeliveries}%</div>
                <p className="text-xs text-muted-foreground">
                  Performance metric
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.safetyScore}</div>
                <p className="text-xs text-muted-foreground">
                  Safety rating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HOS Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.hosCompliance}%</div>
                <p className="text-xs text-muted-foreground">
                  Hours of service
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-gray-600 mt-8">
            <h2 className="text-xl font-semibold mb-2">Welcome to Davali Freight Dashboard</h2>
            <p>Dashboard loaded successfully! User: {driver.name} ({driver.role})</p>
          </div>
        </div>
      </main>
    </div>
  );
}