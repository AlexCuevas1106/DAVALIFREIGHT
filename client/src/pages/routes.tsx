
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  Route,
  Navigation
} from "lucide-react";
import { TOMTOM_CONFIG } from "@/config/maps";

// Dynamic import for TomTom SDK
const loadTomTomSDK = async () => {
  try {
    const tt = await import('@tomtom-international/web-sdk-maps');
    return tt.default || tt;
  } catch (error) {
    console.error('Error loading TomTom SDK:', error);
    return null;
  }
};

interface RouteData {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  status: 'active' | 'completed' | 'planned';
}

export default function Routes() {
  const [routes, setRoutes] = useState<RouteData[]>([
    {
      id: 1,
      name: "Route A1",
      origin: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      distance: "372 mi",
      duration: "5h 30m",
      status: "active"
    },
    {
      id: 2,
      name: "Route B2",
      origin: "Chicago, IL",
      destination: "Detroit, MI",
      distance: "283 mi",
      duration: "4h 15m",
      status: "planned"
    }
  ]);

  const [newRoute, setNewRoute] = useState({
    name: '',
    origin: '',
    destination: ''
  });

  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        setMapError('');
        console.log("Initializing TomTom map...");
        
        const tt = await loadTomTomSDK();
        if (!tt) {
          setMapError('Failed to load TomTom SDK');
          return;
        }

        if (!TOMTOM_CONFIG.apiKey) {
          setMapError('TomTom API key not configured');
          return;
        }

        mapInstance.current = tt.map({
          key: TOMTOM_CONFIG.apiKey,
          container: mapRef.current,
          center: [TOMTOM_CONFIG.defaultCenter.lng, TOMTOM_CONFIG.defaultCenter.lat],
          zoom: TOMTOM_CONFIG.defaultZoom,
          style: TOMTOM_CONFIG.mapStyle
        });

        mapInstance.current.on('load', () => {
          console.log('Map loaded successfully');
          setIsMapLoaded(true);
        });

        mapInstance.current.on('error', (error: any) => {
          console.error('Map error:', error);
          setMapError('Map failed to load');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, []);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const addRoute = () => {
    if (newRoute.name && newRoute.origin && newRoute.destination) {
      const route: RouteData = {
        id: routes.length + 1,
        name: newRoute.name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        distance: "Calculating...",
        duration: "Calculating...",
        status: 'planned'
      };
      setRoutes([...routes, route]);
      setNewRoute({ name: '', origin: '', destination: '' });
    }
  };

  const deleteRoute = (id: number) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Header title="Routes Management" />
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Routes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Route Form */}
              <div className="grid gap-3 p-4 border rounded-lg bg-gray-50">
                <div className="grid gap-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    placeholder="Enter route name"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    placeholder="Starting location"
                    value={newRoute.origin}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, origin: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Ending location"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
                <Button onClick={addRoute} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </div>

              <Separator />

              {/* Routes List */}
              <div className="space-y-3">
                {routes.map((route) => (
                  <div 
                    key={route.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoute?.id === route.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{route.name}</h3>
                          <Badge className={getStatusColor(route.status)}>
                            {route.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            From: {route.origin}
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            To: {route.destination}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {route.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {route.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoute(route.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {routes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No routes created yet</p>
                  <p className="text-sm">Add your first route using the form above</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedRoute && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedRoute.name}</h4>
                  <p className="text-sm text-blue-700">
                    {selectedRoute.origin} → {selectedRoute.destination}
                  </p>
                </div>
              )}
              
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border bg-gray-100 flex items-center justify-center"
                >
                  {mapError ? (
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Map Preview</p>
                      <p className="text-sm text-red-500">{mapError}</p>
                    </div>
                  ) : !isMapLoaded ? (
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Loading Map...</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {!selectedRoute && (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a route to view on map</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
