import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent } from "../components/ui/card";
import { Clipboard, Clock, Car, Users, Trophy, MapPin } from "lucide-react";

interface DashboardData {
  driver?: {
    name?: string;
    username?: string;
  };
  metrics?: {
    onTimeDeliveries?: number;
    hosCompliance?: number;
  };
  currentVehicle?: {
    vehicleNumber?: string;
    model?: string;
  };
  currentShipment?: {
    shippingId?: string;
    status?: string;
  };
  totalDocuments?: number;
}

export default function Dashboard() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("No user ID available");
      const response = await fetch(`/api/dashboard/${currentUser.id}`, { credentials: "include" });
      if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  if (authLoading || isLoading) {
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
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }
  const driver = dashboardData.driver || { name: "--", username: "--" };
  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            ¡Bienvenido{currentUser?.name ? `, ${currentUser.name}` : ''}!
          </h1>
          <p className="text-gray-600">Resumen general de tu operación y métricas clave.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Conductores */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Conductores</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{driver.name}</div>
            <div className="text-xs text-gray-500 mt-1">Usuario: {driver.username}</div>
          </div>
          {/* Vehículo actual */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Vehículo actual</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{dashboardData?.currentVehicle?.vehicleNumber || '--'}</div>
            <div className="text-xs text-gray-500 mt-1">Modelo: {dashboardData?.currentVehicle?.model || '--'}</div>
          </div>
          {/* Documentos */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Clipboard className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Documentos</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{dashboardData?.totalDocuments ?? '--'}</div>
            <div className="text-xs text-gray-500 mt-1">Total de documentos</div>
          </div>
          {/* Entregas a tiempo */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Entregas a tiempo</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{dashboardData?.metrics?.onTimeDeliveries ?? '--'}</div>
            <div className="text-xs text-gray-500 mt-1">Último mes</div>
          </div>
          {/* HOS Compliance */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">HOS Compliance</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{dashboardData?.metrics?.hosCompliance ?? '--'}%</div>
            <div className="text-xs text-gray-500 mt-1">Cumplimiento HOS</div>
          </div>
          {/* Ruta actual */}
          <div className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Ruta actual</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{dashboardData?.currentShipment?.shippingId || '--'}</div>
            <div className="text-xs text-gray-500 mt-1">Estado: {dashboardData?.currentShipment?.status || '--'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}