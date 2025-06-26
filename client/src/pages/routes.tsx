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
import { Loader } from "@googlemaps/js-api-loader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_MAPS_CONFIG } from "@/config/maps";
import type { Route as RouteType, InsertRoute } from "@shared/schema";

export default function Routes() {
  const { toast } = useToast();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeName, setRouteName] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
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
        description: "The route has been created successfully",
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

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.apiKey,
          version: "weekly",
          libraries: GOOGLE_MAPS_CONFIG.libraries
        });

        await loader.load();
        setIsGoogleMapsLoaded(true);

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: GOOGLE_MAPS_CONFIG.defaultCenter,
            zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          const directionsServiceInstance = new google.maps.DirectionsService();
          const directionsRendererInstance = new google.maps.DirectionsRenderer({
            draggable: true,
            panel: document.getElementById("directions-panel") as HTMLElement,
          });
          const geocoderInstance = new google.maps.Geocoder();

          directionsRendererInstance.setMap(mapInstance);

          setMap(mapInstance);
          setDirectionsService(directionsServiceInstance);
          setDirectionsRenderer(directionsRendererInstance);
          setGeocoder(geocoderInstance);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Maps Error",
          description: "Failed to load Google Maps. Using fallback mode.",
          variant: "destructive",
        });
        setIsGoogleMapsLoaded(false);
      }
    };

    initGoogleMaps();
  }, [toast]);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    if (!geocoder || !isGoogleMapsLoaded) {
      // Fallback coordinates if Google Maps fails
      return { lat: 25.7617, lng: -80.1918 };
    }

    try {
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result.length > 0) {
        const location = result[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    // Fallback coordinates
    return { lat: 25.7617, lng: -80.1918 };
  };

  const calculateRoute = async () => {
    if (!origin || !destination || !routeName) {
      toast({
        title: "Required fields",
        description: "Please complete all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (directionsService && directionsRenderer && isGoogleMapsLoaded) {
        // Use Google Maps Directions API
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false,
            },
            (result, status) => {
              if (status === "OK" && result) {
                resolve(result);
              } else {
                reject(new Error(`Directions request failed: ${status}`));
              }
            }
          );
        });

        // Display route on map
        directionsRenderer.setDirections(result);

        const route = result.routes[0];
        const leg = route.legs[0];
        
        const distance = Math.round(leg.distance?.value! / 1000); // Convert to km
        const duration = Math.round(leg.duration?.value! / 60); // Convert to minutes

        const routeData: InsertRoute = {
          name: routeName,
          origin: leg.start_address,
          destination: leg.end_address,
          originLat: leg.start_location.lat(),
          originLng: leg.start_location.lng(),
          destinationLat: leg.end_location.lat(),
          destinationLng: leg.end_location.lng(),
          distance,
          estimatedDuration: duration,
          driverId: 1,
          status: "planned",
        };

        createRouteMutation.mutate(routeData);
      } else {
        // Fallback to geocoding method
        const originCoords = await geocodeAddress(origin);
        const destCoords = await geocodeAddress(destination);
        
        const distance = calculateDistance(
          originCoords.lat, originCoords.lng,
          destCoords.lat, destCoords.lng
        );
        
        const estimatedDuration = Math.round(distance * 1.2);

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
        description: "Could not calculate route. Please try again.",
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

  const displayRouteOnMap = (route: RouteType) => {
    if (!directionsService || !directionsRenderer || !isGoogleMapsLoaded) return;

    directionsService.route(
      {
        origin: { lat: route.originLat!, lng: route.originLng! },
        destination: { lat: route.destinationLat!, lng: route.destinationLng! },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
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
          <h1 className="text-3xl font-bold tracking-tight">Transportation Routes</h1>
          <p className="text-muted-foreground">
            Plan and manage your shipment routes
          </p>
        </div>
        <Button onClick={() => setSelectedRoute(null)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Route
        </Button>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Route</TabsTrigger>
          <TabsTrigger value="routes">Existing Routes</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Plan New Route
              </CardTitle>
              <CardDescription>
                Enter origin and destination to calculate the best route
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    placeholder="e.g., Miami - Orlando Express"
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
              
              <Button
                onClick={calculateRoute}
                disabled={createRouteMutation.isPending}
                className="w-full"
              >
                {createRouteMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Calculate Route
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
                  <Route className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No routes found</h3>
                  <p className="text-muted-foreground text-center">
                    Create your first route to start planning your shipments
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
              <CardTitle>Route Map</CardTitle>
              <CardDescription>
                Visualize all routes on the interactive map
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
                  {!isGoogleMapsLoaded && (
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Loading Google Maps...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Existing Routes</h4>
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
                                  {route.distance} km
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
                          No routes available
                        </p>
                      )}
                    </div>
                  </div>
                  <div id="directions-panel" className="text-xs bg-muted p-2 rounded max-h-40 overflow-y-auto">
                    <p className="text-muted-foreground">
                      Route directions will appear here when a route is calculated.
                    </p>
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