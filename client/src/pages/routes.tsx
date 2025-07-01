import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Route, Truck } from "lucide-react";
import { TOMTOM_CONFIG } from "@/config/maps";

// TomTom SDK imports
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';

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

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current && TOMTOM_CONFIG.apiKey) {
      console.log("Initializing TomTom map with API key:", TOMTOM_CONFIG.apiKey);

      try {
        mapInstance.current = tt.map({
          key: TOMTOM_CONFIG.apiKey,
          container: mapRef.current,
          center: [TOMTOM_CONFIG.defaultCenter.lng, TOMTOM_CONFIG.defaultCenter.lat],
          zoom: TOMTOM_CONFIG.defaultZoom,
          style: TOMTOM_CONFIG.mapStyle
        });

        mapInstance.current.on('load', () => {
          console.log("TomTom map loaded successfully");
          setIsMapLoaded(true);
        });

        mapInstance.current.on('error', (error: any) => {
          console.error("TomTom map error:", error);
        });

      } catch (error) {
        console.error("Error initializing TomTom map:", error);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Calculate route using TomTom API
  const calculateRoute = async (origin: string, destination: string) => {
    if (!TOMTOM_CONFIG.apiKey || !isMapLoaded) {
      console.error("TomTom API key not available or map not loaded");
      return;
    }

    try {
      // Geocode origin and destination
      const originResponse = await ttServices.services.fuzzySearch({
        key: TOMTOM_CONFIG.apiKey,
        query: origin
      });

      const destinationResponse = await ttServices.services.fuzzySearch({
        key: TOMTOM_CONFIG.apiKey,
        query: destination
      });

      if (originResponse.results.length > 0 && destinationResponse.results.length > 0) {
        const originCoords = originResponse.results[0].position;
        const destinationCoords = destinationResponse.results[0].position;

        // Calculate route with truck parameters
        const routeResponse = await ttServices.services.calculateRoute({
          key: TOMTOM_CONFIG.apiKey,
          locations: `${originCoords.lat},${originCoords.lon}:${destinationCoords.lat},${destinationCoords.lon}`,
          travelMode: 'truck',
          vehicleMaxSpeed: TOMTOM_CONFIG.truckOptions.vehicleMaxSpeed,
          vehicleWeight: TOMTOM_CONFIG.truckOptions.vehicleWeight,
          vehicleAxleWeight: TOMTOM_CONFIG.truckOptions.vehicleAxleWeight,
          vehicleLength: TOMTOM_CONFIG.truckOptions.vehicleLength,
          vehicleWidth: TOMTOM_CONFIG.truckOptions.vehicleWidth,
          vehicleHeight: TOMTOM_CONFIG.truckOptions.vehicleHeight,
          vehicleCommercial: TOMTOM_CONFIG.truckOptions.vehicleCommercial
        });

        if (routeResponse.routes && routeResponse.routes.length > 0) {
          const route = routeResponse.routes[0];

          // Clear existing layers
          if (mapInstance.current.getSource('route')) {
            mapInstance.current.removeLayer('route');
            mapInstance.current.removeSource('route');
          }

          // Add route to map
          mapInstance.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.legs[0].points
            }
          });

          mapInstance.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4
            }
          });

          // Add markers
          new tt.Marker({ color: 'green' })
            .setLngLat([originCoords.lon, originCoords.lat])
            .addTo(mapInstance.current);

          new tt.Marker({ color: 'red' })
            .setLngLat([destinationCoords.lon, destinationCoords.lat])
            .addTo(mapInstance.current);

          // Fit map to route bounds
          const bounds = new tt.LngLatBounds();
          bounds.extend([originCoords.lon, originCoords.lat]);
          bounds.extend([destinationCoords.lon, destinationCoords.lat]);
          mapInstance.current.fitBounds(bounds, { padding: 50 });

          return {
            distance: `${Math.round(route.summary.lengthInMeters / 1000)} km`,
            duration: `${Math.round(route.summary.travelTimeInSeconds / 60)} min`
          };
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    }
    return null;
  };

  const handleCreateRoute = async () => {
    if (newRoute.name && newRoute.origin && newRoute.destination) {
      const routeData = await calculateRoute(newRoute.origin, newRoute.destination);

      const route: RouteData = {
        id: routes.length + 1,
        name: newRoute.name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        distance: routeData?.distance || "Calculating...",
        duration: routeData?.duration || "Calculating...",
        status: 'planned'
      };

      setRoutes([...routes, route]);
      setNewRoute({ name: '', origin: '', destination: '' });
      setSelectedRoute(route);
    }
  };

  const handleRouteSelect = (route: RouteData) => {
    setSelectedRoute(route);
    calculateRoute(route.origin, route.destination);
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Planning</h1>
        <p className="text-gray-600">Plan and manage your truck routes efficiently</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Route Creation Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Create New Route
              </CardTitle>
              <CardDescription>
                Plan a new truck route with optimized paths
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="route-name">Route Name</Label>
                <Input
                  id="route-name"
                  placeholder="Enter route name"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  placeholder="Enter starting location"
                  value={newRoute.origin}
                  onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={newRoute.destination}
                  onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleCreateRoute}
                className="w-full"
                disabled={!newRoute.name || !newRoute.origin || !newRoute.destination}
              >
                <Truck className="w-4 h-4 mr-2" />
                Calculate Route
              </Button>
            </CardContent>
          </Card>

          {/* Routes List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Routes</CardTitle>
              <CardDescription>
                Click on a route to view it on the map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedRoute?.id === route.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleRouteSelect(route)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{route.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                        {route.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        From: {route.origin}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        To: {route.destination}
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span>Distance: {route.distance}</span>
                        <span>Duration: {route.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
              <CardDescription>
                Interactive map showing your truck routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="w-full h-96 rounded-lg border border-gray-200"
                style={{ minHeight: '400px' }}
              >
                {!isMapLoaded && (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading TomTom Map...</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedRoute && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Selected Route: {selectedRoute.name}</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>From: {selectedRoute.origin}</p>
                    <p>To: {selectedRoute.destination}</p>
                    <p>Distance: {selectedRoute.distance} | Duration: {selectedRoute.duration}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}