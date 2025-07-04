
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Route, Clock, Truck, Plus, Search } from "lucide-react";
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TOMTOM_CONFIG } from "@/config/maps";
import type { Route as RouteType, InsertRoute } from "@shared/schema";

export default function Routes() {
  const { toast } = useToast();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeName, setRouteName] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [map, setMap] = useState<tt.Map | null>(null);
  const [isTomTomLoaded, setIsTomTomLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["/api/routes"],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (routeData: InsertRoute) => {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });
      if (!response.ok) {
        throw new Error("Failed to create route");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Route created",
        description: "The truck route has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      setOrigin("");
      setDestination("");
      setRouteName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not create route",
        variant: "destructive",
      });
    },
  });

  // Initialize TomTom Map
  useEffect(() => {
    const initTomTomMap = async () => {
      try {
        if (mapRef.current && TOMTOM_CONFIG.apiKey) {
          console.log("Initializing TomTom map with API key:", TOMTOM_CONFIG.apiKey.substring(0, 8) + "...");
          
          const mapInstance = tt.map({
            key: TOMTOM_CONFIG.apiKey,
            container: mapRef.current,
            center: [TOMTOM_CONFIG.defaultCenter.lng, TOMTOM_CONFIG.defaultCenter.lat],
            zoom: TOMTOM_CONFIG.defaultZoom,
            stylesVisibility: {
              trafficIncidents: true,
              trafficFlow: true,
            },
          });

          mapInstance.on('load', () => {
            console.log("TomTom map loaded successfully");
            setMap(mapInstance);
            setIsTomTomLoaded(true);
            
            // Add navigation controls
            mapInstance.addControl(new tt.NavigationControl());
            mapInstance.addControl(new tt.FullscreenControl());
          });

          mapInstance.on('error', (error) => {
            console.error("TomTom map error:", error);
            setIsTomTomLoaded(false);
            toast({
              title: "Maps Error",
              description: "Failed to load TomTom Maps. Check API key and internet connection.",
              variant: "destructive",
            });
          });

        } else {
          console.log("TomTom API key not configured");
          setIsTomTomLoaded(false);
        }
      } catch (error) {
        console.error("Error initializing TomTom Maps:", error);
        toast({
          title: "Maps Error",
          description: "Failed to initialize TomTom Maps. Please check your API key.",
          variant: "destructive",
        });
        setIsTomTomLoaded(false);
      }
    };

    // Add a small delay to ensure the DOM is ready
    const timeoutId = setTimeout(initTomTomMap, 100);

    return () => {
      clearTimeout(timeoutId);
      if (map) {
        map.remove();
      }
    };
  }, [toast]);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    if (!isTomTomLoaded || !TOMTOM_CONFIG.apiKey) {
      // Fallback coordinates if TomTom fails
      return { lat: 25.7617, lng: -80.1918 };
    }

    try {
      const response = await ttServices.services.geocode({
        key: TOMTOM_CONFIG.apiKey,
        query: address,
        limit: 1,
      });

      if (response.results && response.results.length > 0) {
        const location = response.results[0].position;
        return {
          lat: location.lat,
          lng: location.lon,
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    // Fallback coordinates
    return { lat: 25.7617, lng: -80.1918 };
  };

  const calculateTruckRoute = async () => {
    if (!origin || !destination || !routeName) {
      toast({
        title: "Required fields",
        description: "Please complete all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isTomTomLoaded && TOMTOM_CONFIG.apiKey !== "YOUR_TOMTOM_API_KEY_HERE") {
        // Get coordinates for origin and destination
        const originCoords = await geocodeAddress(origin);
        const destCoords = await geocodeAddress(destination);

        // Calculate truck route using TomTom Routing API
        const routeResponse = await ttServices.services.calculateRoute({
          key: TOMTOM_CONFIG.apiKey,
          locations: [
            [originCoords.lng, originCoords.lat],
            [destCoords.lng, destCoords.lat]
          ],
          travelMode: 'truck',
          vehicleMaxSpeed: TOMTOM_CONFIG.truckOptions.vehicleMaxSpeed,
          vehicleWeight: TOMTOM_CONFIG.truckOptions.vehicleWeight,
          vehicleAxleWeight: TOMTOM_CONFIG.truckOptions.vehicleAxleWeight,
          vehicleLength: TOMTOM_CONFIG.truckOptions.vehicleLength,
          vehicleWidth: TOMTOM_CONFIG.truckOptions.vehicleWidth,
          vehicleHeight: TOMTOM_CONFIG.truckOptions.vehicleHeight,
          vehicleCommercial: TOMTOM_CONFIG.truckOptions.vehicleCommercial,
          vehicleLoadType: TOMTOM_CONFIG.truckOptions.vehicleLoadType,
          traffic: true,
          routeType: 'eco', // Eco-friendly routing for trucks
          instructionsType: 'text',
        });

        if (routeResponse.routes && routeResponse.routes.length > 0) {
          const route = routeResponse.routes[0];
          const summary = route.summary;
          
          const distance = Math.round(summary.lengthInMeters / 1000); // Convert to km
          const duration = Math.round(summary.travelTimeInSeconds / 60); // Convert to minutes

          // Display route on map
          if (map) {
            // Clear existing markers and routes
            map.getMarkers().forEach(marker => marker.remove());
            map.getLayers().forEach(layer => {
              if (layer.getId && layer.getId().includes('route')) {
                map.removeLayer(layer);
              }
            });

            // Add origin marker
            new tt.Marker({ color: 'green' })
              .setLngLat([originCoords.lng, originCoords.lat])
              .setPopup(new tt.Popup().setHTML(`<strong>Origin:</strong><br>${origin}`))
              .addTo(map);

            // Add destination marker
            new tt.Marker({ color: 'red' })
              .setLngLat([destCoords.lng, destCoords.lat])
              .setPopup(new tt.Popup().setHTML(`<strong>Destination:</strong><br>${destination}`))
              .addTo(map);

            // Add route line
            const routeGeoJson = route.legs[0].points.map(point => [point.longitude, point.latitude]);
            
            map.addLayer({
              'id': 'truck-route',
              'type': 'line',
              'source': {
                'type': 'geojson',
                'data': {
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                    'type': 'LineString',
                    'coordinates': routeGeoJson
                  }
                }
              },
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#FF6B35',
                'line-width': 6,
                'line-opacity': 0.8
              }
            });

            // Fit map to route bounds
            const bounds = new tt.LngLatBounds();
            routeGeoJson.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 50 });
          }

          const routeData: InsertRoute = {
            name: routeName,
            origin: origin,
            destination: destination,
            originLat: originCoords.lat,
            originLng: originCoords.lng,
            destinationLat: destCoords.lat,
            destinationLng: destCoords.lng,
            distance,
            estimatedDuration: duration,
            driverId: 1,
            status: "planned",
          };

          createRouteMutation.mutate(routeData);
        }
      } else {
        // Fallback to basic geocoding method
        const originCoords = await geocodeAddress(origin);
        const destCoords = await geocodeAddress(destination);
        
        const distance = calculateDistance(
          originCoords.lat, originCoords.lng,
          destCoords.lat, destCoords.lng
        );
        
        const estimatedDuration = Math.round(distance * 1.5); // Slower for trucks

        const routeData: InsertRoute = {
          name: routeName,
          origin,
          destination,
          originLat: originCoords.lat,
          originLng: originCoords.lng,
          destinationLat: destCoords.lat,
          destinationLng: destCoords.lng,
          distance: Math.round(distance),
          estimatedDuration,
          driverId: 1,
          status: "planned",
        };

        createRouteMutation.mutate(routeData);
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      toast({
        title: "Error",
        description: "Could not calculate truck route. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const displayRouteOnMap = async (route: RouteType) => {
    if (!map || !isTomTomLoaded) return;

    try {
      // Clear existing markers and routes
      map.getMarkers().forEach(marker => marker.remove());
      map.getLayers().forEach(layer => {
        if (layer.getId && layer.getId().includes('route')) {
          map.removeLayer(layer);
        }
      });

      // Add markers
      new tt.Marker({ color: 'green' })
        .setLngLat([route.originLng!, route.originLat!])
        .setPopup(new tt.Popup().setHTML(`<strong>Origin:</strong><br>${route.origin}`))
        .addTo(map);

      new tt.Marker({ color: 'red' })
        .setLngLat([route.destinationLng!, route.destinationLat!])
        .setPopup(new tt.Popup().setHTML(`<strong>Destination:</strong><br>${route.destination}`))
        .addTo(map);

      // Calculate and display route
      const routeResponse = await ttServices.services.calculateRoute({
        key: TOMTOM_CONFIG.apiKey,
        locations: [
          [route.originLng!, route.originLat!],
          [route.destinationLng!, route.destinationLat!]
        ],
        travelMode: 'truck',
        vehicleMaxSpeed: TOMTOM_CONFIG.truckOptions.vehicleMaxSpeed,
        vehicleWeight: TOMTOM_CONFIG.truckOptions.vehicleWeight,
        vehicleAxleWeight: TOMTOM_CONFIG.truckOptions.vehicleAxleWeight,
        vehicleLength: TOMTOM_CONFIG.truckOptions.vehicleLength,
        vehicleWidth: TOMTOM_CONFIG.truckOptions.vehicleWidth,
        vehicleHeight: TOMTOM_CONFIG.truckOptions.vehicleHeight,
        vehicleCommercial: TOMTOM_CONFIG.truckOptions.vehicleCommercial,
      });

      if (routeResponse.routes && routeResponse.routes.length > 0) {
        const routeGeoJson = routeResponse.routes[0].legs[0].points.map(point => [point.longitude, point.latitude]);
        
        map.addLayer({
          'id': 'displayed-route',
          'type': 'line',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': routeGeoJson
              }
            }
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#FF6B35',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        const bounds = new tt.LngLatBounds();
        routeGeoJson.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Error displaying route:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned": return "Planned";
      case "active": return "Active";
      case "completed": return "Completed";
      default: return "Planned";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Truck Transportation Routes</h1>
          <p className="text-muted-foreground">
            Plan and manage your truck shipment routes with TomTom
          </p>
        </div>
        <Button onClick={() => setSelectedRoute(null)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Truck Route
        </Button>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Truck Route</TabsTrigger>
          <TabsTrigger value="routes">Existing Routes</TabsTrigger>
          <TabsTrigger value="map">Route Map</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Plan New Truck Route
              </CardTitle>
              <CardDescription>
                Enter origin and destination to calculate the best truck route with TomTom
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    placeholder="e.g., Miami - Orlando Truck Route"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    placeholder="e.g., Miami, FL"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Orlando, FL"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Truck Route Optimization</span>
                </div>
                <p className="text-sm text-orange-700">
                  Routes are optimized for commercial trucks considering weight, height, and width restrictions, 
                  avoiding low bridges and weight-restricted roads.
                </p>
              </div>
              
              <Button
                onClick={calculateTruckRoute}
                disabled={createRouteMutation.isPending}
                className="w-full"
              >
                {createRouteMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating Truck Route...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Calculate Truck Route
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4">
            {!Array.isArray(routes) || routes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No truck routes found</h3>
                  <p className="text-muted-foreground text-center">
                    Create your first truck route to start planning your shipments
                  </p>
                </CardContent>
              </Card>
            ) : (
              (routes as RouteType[]).map((route: RouteType) => (
                <Card key={route.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{route.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {route.origin}
                          </div>
                          <span>→</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {route.destination}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {route.distance && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {route.distance} km
                            </div>
                          )}
                          {route.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(route.status)}>
                        {getStatusText(route.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TomTom Truck Route Map</CardTitle>
              <CardDescription>
                Visualize all truck routes on the interactive TomTom map with traffic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div 
                    ref={mapRef}
                    className="h-96 w-full rounded-lg border"
                    style={{ minHeight: '400px' }}
                  />
                  {!isTomTomLoaded && (
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {!TOMTOM_CONFIG.apiKey 
                            ? "Please configure your TomTom API key" 
                            : "Loading TomTom Maps..."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Truck Routes</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {Array.isArray(routes) && routes.length > 0 ? (
                        (routes as RouteType[]).map((route: RouteType) => (
                          <Card 
                            key={route.id} 
                            className="p-3 cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => displayRouteOnMap(route)}
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{route.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {route.origin} → {route.destination}
                              </p>
                              {route.distance && (
                                <p className="text-xs text-muted-foreground">
                                  {route.distance} km (Truck Optimized)
                                </p>
                              )}
                              <Badge size="sm" className={getStatusColor(route.status)}>
                                {getStatusText(route.status)}
                              </Badge>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No truck routes available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded text-xs">
                    <p className="font-medium mb-1">TomTom Truck Features:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Weight & height restrictions</li>
                      <li>• Bridge clearance optimization</li>
                      <li>• Commercial vehicle routing</li>
                      <li>• Real-time traffic data</li>
                      <li>• Eco-friendly route options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
