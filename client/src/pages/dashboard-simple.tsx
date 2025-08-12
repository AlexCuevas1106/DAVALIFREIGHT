import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WelcomeAnimation } from "@/components/welcome-animation";
import { Clock, FileText, MapPin, Car, Users, Clipboard, ChevronRight, Trophy, Mail, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Timer state for duty status
  const [dutyTimer, setDutyTimer] = useState(0);
  
  // Update duty timer
  useEffect(() => {
    if (driver?.status !== 'off_duty' && driver?.dutyStartTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(driver.dutyStartTime!).getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setDutyTimer(elapsedSeconds);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [driver?.status, driver?.dutyStartTime]);
  
  // Format timer display
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Mutation for updating driver status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/drivers/${currentUser?.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", currentUser?.id] });
      toast({
        title: "Estado actualizado",
        description: "El estado del conductor ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del conductor.",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64">
        {/* Header with driver info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{driver?.name || currentUser?.name}</h1>
              <div className="flex items-center space-x-2 text-gray-500">
                <Trophy className="w-4 h-4" />
                <Mail className="w-4 h-4" />
                <Settings className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 max-w-md mx-auto">
          {/* Status Section with Dropdown for Drivers */}
          <Card className="mb-6">
            <CardContent className="p-4">
              {currentUser?.role === 'driver' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      OFF
                    </div>
                    <div>
                      <Select 
                        value={driver?.status || currentUser?.status || 'off_duty'} 
                        onValueChange={handleStatusChange}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-[140px] border-0 shadow-none p-0 h-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off_duty">Off Duty</SelectItem>
                          <SelectItem value="on_duty">On Duty</SelectItem>
                          <SelectItem value="driving">Driving</SelectItem>
                          <SelectItem value="sleeper">Sleeper</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-gray-500">
                        {driver?.status !== 'off_duty' ? formatTimer(dutyTimer) : '(00:21)'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      {driver?.status === 'off_duty' ? 'OFF' : 
                       driver?.status === 'on_duty' ? 'ON' : 
                       driver?.status === 'driving' ? 'DRV' : 'SLP'}
                    </div>
                    <div>
                      <div className="font-medium capitalize">
                        {(driver?.status || currentUser?.status || 'off_duty').replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver?.status !== 'off_duty' ? formatTimer(dutyTimer) : '(00:21)'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle and Trailer Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vehicle</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {dashboardData?.currentVehicle?.vehicleNumber || '25'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trailer</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {dashboardData?.currentTrailer?.trailerNumber || '00'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping IDs</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {dashboardData?.currentShipment?.shippingId || '3-86539'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Modules Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* HoS - Blue */}
            <Card className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <Clock className="w-8 h-8 mb-2" />
                <span className="font-semibold">HoS</span>
              </CardContent>
            </Card>

            {/* DVIR - Green */}
            <Card className="bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <Clipboard className="w-8 h-8 mb-2" />
                <span className="font-semibold">DVIR</span>
              </CardContent>
            </Card>

            {/* Routes - Red */}
            <Card className="bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <MapPin className="w-8 h-8 mb-2" />
                <span className="font-semibold">Routes</span>
              </CardContent>
            </Card>

            {/* Documents - Purple */}
            <Card className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <FileText className="w-8 h-8 mb-2" />
                <span className="font-semibold">Documents</span>
              </CardContent>
            </Card>

            {/* Vehicle - Orange */}
            <Card className="bg-orange-500 text-white hover:bg-orange-600 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <Car className="w-8 h-8 mb-2" />
                <span className="font-semibold">Vehicle</span>
              </CardContent>
            </Card>

            {/* Driving Team - Gray */}
            <Card className="bg-gray-500 text-white hover:bg-gray-600 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <Users className="w-8 h-8 mb-2" />
                <div className="text-sm">
                  <div>Driving</div>
                  <div>Team</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}