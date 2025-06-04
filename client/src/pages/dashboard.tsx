import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ModuleCard } from "@/components/module-card";
import { StatusSelector } from "@/components/status-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDuration, formatRelativeTime, getStatusColor } from "@/lib/utils";
import { 
  Clock, 
  ClipboardCheck, 
  Route, 
  FileText, 
  Truck, 
  Users,
  Trophy
} from "lucide-react";
import type { ActivityLog } from "@shared/schema";

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
  currentVehicle: {
    id: number;
    vehicleNumber: string;
    fuelLevel: number;
  } | null;
  currentTrailer: {
    id: number;
    trailerNumber: string;
  } | null;
  currentShipment: {
    id: number;
    shippingId: string;
    destination: string;
    actualDistance: number;
  } | null;
  hos: {
    remainingDriveTime: number;
    remainingDutyTime: number;
    drivingHours: number;
    onDutyHours: number;
    isCompliant: boolean;
  } | null;
  pendingInspections: number;
  totalDocuments: number;
  recentActivities: ActivityLog[];
  metrics: {
    onTimeDeliveries: number;
    fuelEfficiency: number;
    safetyScore: number;
    hosCompliance: number;
  };
}

export default function Dashboard() {
  const [dutyTimer, setDutyTimer] = useState<number>(0);
  const queryClient = useQueryClient();
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/1'], // Using driver ID 1 (Skyler Droubay)
  });

  // Calculate duty timer
  useEffect(() => {
    if (dashboardData?.driver.dutyStartTime && dashboardData.driver.status === 'off_duty') {
      const dutyStart = new Date(dashboardData.driver.dutyStartTime);
      const updateTimer = () => {
        const now = new Date();
        const diffMs = now.getTime() - dutyStart.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        setDutyTimer(diffMins);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [dashboardData]);

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

  const { driver, currentVehicle, currentTrailer, currentShipment, hos, pendingInspections, totalDocuments, recentActivities, metrics } = dashboardData;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <Header 
          driver={driver}
          status={driver.status}
        />
        
        <div className="p-6">
          {/* Current Status Section */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
                    {driver.status === 'off_duty' && dutyTimer > 0 && (
                      <Badge variant="outline" className="text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(dutyTimer)}
                      </Badge>
                    )}
                  </div>
                  <StatusSelector 
                    driverId={driver.id}
                    currentStatus={driver.status}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Vehicle</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentVehicle?.vehicleNumber || '--'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Trailer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentTrailer?.trailerNumber || '00'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Shipping IDs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentShipment?.shippingId || '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ModuleCard
              title="Hours of Service"
              subtitle="Track driving hours and duty status"
              icon={Clock}
              color="bg-blue-600"
              status="Active"
              mainValue={hos ? `${Math.floor(hos.remainingDriveTime)}h ${Math.floor((hos.remainingDriveTime % 1) * 60)}m` : '11h 0m'}
              description="Remaining drive time"
              onClick={() => console.log('Opening HoS module')}
            />

            <ModuleCard
              title="DVIR"
              subtitle="Driver Vehicle Inspection Reports"
              icon={ClipboardCheck}
              color="bg-green-600"
              status={pendingInspections > 0 ? "Pending" : "Complete"}
              mainValue={pendingInspections.toString()}
              description="Pending inspections"
              onClick={() => console.log('Opening DVIR module')}
            />

            <ModuleCard
              title="Routes"
              subtitle="Route planning and navigation"
              icon={Route}
              color="bg-red-600"
              status="Active"
              mainValue={currentShipment?.actualDistance?.toString() || '0'}
              description="Miles remaining"
              onClick={() => console.log('Opening Routes module')}
            />

            <ModuleCard
              title="Documents"
              subtitle="Bills of lading and paperwork"
              icon={FileText}
              color="bg-purple-600"
              status="Updated"
              mainValue={totalDocuments.toString()}
              description="Total documents"
              onClick={() => console.log('Opening Documents module')}
            />

            <ModuleCard
              title="Vehicle"
              subtitle="Vehicle status and maintenance"
              icon={Truck}
              color="bg-orange-600"
              status="Good"
              mainValue={currentVehicle ? `${Math.round(currentVehicle.fuelLevel)}%` : '0%'}
              description="Fuel level"
              onClick={() => console.log('Opening Vehicle module')}
            />

            <ModuleCard
              title="Driving Team"
              subtitle="Team coordination and communication"
              icon={Users}
              color="bg-gray-600"
              status="Team"
              mainValue="4"
              description="Active members"
              onClick={() => console.log('Opening Team module')}
            />
          </div>

          {/* Recent Activity and Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.activity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.description} - {formatRelativeTime(new Date(activity.timestamp))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">On-time Deliveries</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics.onTimeDeliveries} className="w-24" />
                      <span className="text-sm font-semibold text-gray-900">{metrics.onTimeDeliveries}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Fuel Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={87} className="w-24" />
                      <span className="text-sm font-semibold text-gray-900">{metrics.fuelEfficiency} MPG</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Safety Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics.safetyScore} className="w-24" />
                      <span className="text-sm font-semibold text-gray-900">{metrics.safetyScore}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">HoS Compliance</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics.hosCompliance} className="w-24" />
                      <span className="text-sm font-semibold text-gray-900">{metrics.hosCompliance}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Excellent Performance!</p>
                      <p className="text-xs text-green-600">You're in the top 10% of drivers this month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
