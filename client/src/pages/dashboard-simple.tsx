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
import { useLocation } from "wouter";

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

  // Timer state for duty status
  const [dutyTimer, setDutyTimer] = useState(0);
  
  // Mobile sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Always call hooks before any early returns
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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

  // Update duty timer
  useEffect(() => {
    if (dashboardData?.driver?.status !== 'off_duty' && dashboardData?.driver?.dutyStartTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(dashboardData.driver.dutyStartTime!).getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setDutyTimer(elapsedSeconds);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [dashboardData?.driver?.status, dashboardData?.driver?.dutyStartTime]);
  
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

  // Navigation function for dashboard modules
  const navigateToModule = (path: string) => {
    setLocation(path);
  };

  // Early returns after all hooks are called
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 desktop-app">
      {/* Mobile Sidebar Overlay - Completely Floating */}
      {isMobileMenuOpen && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Floating sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <span className="text-xl font-bold text-white">Davali Fleet</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 px-6 py-6 overflow-y-auto">
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-center">
                    📊 Dashboard
                  </div>
                  <button 
                    onClick={() => {
                      navigateToModule('/hours-of-service');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Hours of Service</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigateToModule('/inspection');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <Clipboard className="w-5 h-5" />
                    <span>Inspections</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigateToModule('/routes');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Routes</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigateToModule('/documents');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigateToModule('/vehicles');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <Car className="w-5 h-5" />
                    <span>Vehicles</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigateToModule('/driving-team');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center space-x-3"
                  >
                    <Users className="w-5 h-5" />
                    <span>Driving Team</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 desktop-window">
          {/* Logo/Company Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Davali Fleet</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-all">
                Dashboard
              </div>
              <button 
                onClick={() => navigateToModule('/hours-of-service')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Hours of Service
              </button>
              <button 
                onClick={() => navigateToModule('/inspection')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Inspections
              </button>
              <button 
                onClick={() => navigateToModule('/routes')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Routes
              </button>
              <button 
                onClick={() => navigateToModule('/documents')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Documents
              </button>
              <button 
                onClick={() => navigateToModule('/vehicles')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Vehicles
              </button>
              <button 
                onClick={() => navigateToModule('/driving-team')}
                className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
              >
                Driving Team
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 professional-header">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome, {driver?.name || currentUser?.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.role === 'driver' ? 'Driver Dashboard' : 'Admin Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Trophy className="w-5 h-5" />
                <Mail className="w-5 h-5" />
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 lg:p-6">
            {/* Status and Info Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {/* Driver Status Card */}
              <Card className="lg:col-span-1 card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Driver Status</h3>
                  {currentUser?.role === 'driver' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        {driver?.status === 'off_duty' ? 'OFF' : 
                         driver?.status === 'on_duty' ? 'ON' : 
                         driver?.status === 'driving' ? 'DRV' : 'SLP'}
                      </div>
                      <div className="flex-1">
                        <Select 
                          value={driver?.status || currentUser?.status || 'off_duty'} 
                          onValueChange={handleStatusChange}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="border-0 shadow-none p-0 h-auto font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off_duty">Off Duty</SelectItem>
                            <SelectItem value="on_duty">On Duty</SelectItem>
                            <SelectItem value="driving">Driving</SelectItem>
                            <SelectItem value="sleeper">Sleeper</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {driver?.status !== 'off_duty' ? formatTimer(dutyTimer) : 'Off duty'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        {driver?.status === 'off_duty' ? 'OFF' : 
                         driver?.status === 'on_duty' ? 'ON' : 
                         driver?.status === 'driving' ? 'DRV' : 'SLP'}
                      </div>
                      <div>
                        <div className="font-medium capitalize text-gray-900 dark:text-white">
                          {(driver?.status || currentUser?.status || 'off_duty').replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {driver?.status !== 'off_duty' ? formatTimer(dutyTimer) : 'Off duty'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Info Card */}
              <Card className="lg:col-span-2 card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Current Assignment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center sm:text-left">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.currentVehicle?.vehicleNumber || '25'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardData?.currentVehicle?.make} {dashboardData?.currentVehicle?.model}
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trailer</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.currentTrailer?.trailerNumber || '00'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardData?.currentTrailer?.type}
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Load ID</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.currentShipment?.shippingId || '3-86539'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardData?.currentShipment?.origin} → {dashboardData?.currentShipment?.destination}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Modules Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              {/* HoS - Blue */}
              <Card className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors group" onClick={() => navigateToModule('/hours-of-service')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <Clock className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm lg:text-base">HoS</span>
                </CardContent>
              </Card>

              {/* DVIR - Green */}
              <Card className="bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors group" onClick={() => navigateToModule('/inspection')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <Clipboard className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm lg:text-base">DVIR</span>
                </CardContent>
              </Card>

              {/* Routes - Red */}
              <Card className="bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors group" onClick={() => navigateToModule('/routes')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <MapPin className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm lg:text-base">Routes</span>
                </CardContent>
              </Card>

              {/* Documents - Purple */}
              <Card className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer transition-colors group" onClick={() => navigateToModule('/documents')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <FileText className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm lg:text-base">Documents</span>
                </CardContent>
              </Card>

              {/* Vehicle - Orange */}
              <Card className="bg-orange-500 text-white hover:bg-orange-600 cursor-pointer transition-colors group" onClick={() => navigateToModule('/vehicles')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <Car className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm lg:text-base">Vehicle</span>
                </CardContent>
              </Card>

              {/* Driving Team - Gray */}
              <Card className="bg-gray-500 text-white hover:bg-gray-600 cursor-pointer transition-colors group" onClick={() => navigateToModule('/driving-team')}>
                <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center text-center h-24 lg:h-32">
                  <Users className="w-6 h-6 lg:w-8 lg:h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs lg:text-sm font-semibold">
                    <div>Driving</div>
                    <div>Team</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6">
              <Card className="card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics?.onTimeDeliveries || 94}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">On-time</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics?.fuelEfficiency || 8.7} MPG</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Fuel Avg</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics?.safetyScore || 98}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Safety</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics?.hosCompliance || 100}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">HoS Compliance</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}