import { useState, useEffect, useRef, useCallback } from "react";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
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

  // Initialize TomTom Map with proper container detection and retry mechanism
  const initializeMap = useCallback(async () => {
    const maxRetries = 10;
    let retryCount = 0;

    const tryInitialize = () => {
      return new Promise<boolean>((resolve) => {
        if (!TOMTOM_CONFIG.apiKey || TOMTOM_CONFIG.apiKey === "YOUR_TOMTOM_API_KEY_HERE") {
          console.log("TomTom API key not configured");
          setIsTomTomLoaded(false);
          resolve(false);
          return;
        }

        if (!mapRef.current) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Map container not ready, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              tryInitialize().then(resolve);
            }, 200);
            return;
          } else {
            console.log("Map container not ready after maximum retries");
            resolve(false);
            return;
          }
        }

        try {
          console.log("Initializing TomTom map...");

          const mapInstance = tt.map({
            key: TOMTOM_CONFIG.apiKey,
            container: mapRef.current,
            center: [TOMTOM_CONFIG.defaultCenter.lng, TOMTOM_CONFIG.defaultCenter.lat],
            zoom: TOMTOM_CONFIG.defaultZoom,
          });

          mapInstance.on('load', () => {
            console.log("TomTom map loaded successfully");
            setMap(mapInstance);
            setIsTomTomLoaded(true);

            // Add navigation controls
            mapInstance.addControl(new tt.NavigationControl());
            mapInstance.addControl(new tt.FullscreenControl());
            resolve(true);
          });

          mapInstance.on('error', (error) => {
            console.error("TomTom map error:", error);
            setIsTomTomLoaded(false);
            toast({
              title: "Error de mapas",
              description: "No se pudo cargar TomTom Maps. Verifica la clave API y la conexión a internet.",
              variant: "destructive",
            });
            resolve(false);
          });

        } catch (error) {
          console.error("Error initializing TomTom Maps:", error);
          toast({
            title: "Error de mapas",
            description: "No se pudo inicializar TomTom Maps. Por favor verifica tu clave API.",
            variant: "destructive",
          });
          setIsTomTomLoaded(false);
          resolve(false);
        }
      });
    };

    return tryInitialize();
  }, [toast]);

  // Initialize map when the map tab is selected
  const handleTabChange = useCallback((value: string) => {
    if (value === 'map' && !map && !isTomTomLoaded) {
      // Longer delay to ensure the tab content is fully rendered
      setTimeout(() => {
        if (mapRef.current) {
          console.log("Map tab selected, initializing TomTom map...");
          initializeMap();
        }
      }, 500);
    }
  }, [map, isTomTomLoaded, initializeMap]);

  // Effect to initialize map when component mounts on map tab
  useEffect(() => {
    // Only initialize if we're on the map tab from the start
    if (window.location.hash === '#map' || window.location.pathname.includes('map')) {
      setTimeout(() => {
        if (mapRef.current && !map) {
          console.log("Component mounted on map tab, initializing...");
          initializeMap();
        }
      }, 500);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [initializeMap, map]);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    console.log(`Geocoding ${address}. API Key available: ${!!import.meta.env.VITE_TOMTOM_API_KEY}`);

    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    if (!apiKey || apiKey === "YOUR_TOMTOM_API_KEY_HERE") {
      console.warn("TomTom API key not available, using fallback coordinates");
      toast({
        title: "Geocoding Unavailable",
        description: "TomTom API key not configured. Using fallback location.",
        variant: "destructive"
      });
      return { lat: 25.7617, lng: -80.1918 };
    }

    try {
      console.log(`Making TomTom API call for: ${address}`);

      const apiUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(address)}.json?key=${apiKey}&countrySet=US&limit=1`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log('TomTom API response:', data);

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const coords = {
          lat: result.position.lat,
          lng: result.position.lon,
        };
        console.log(`Successfully geocoded ${address} to:`, coords);
        return coords;
      } else {
        console.warn(`No results found for address: ${address}`);
        toast({
          title: "Address Not Found",
          description: `Could not find coordinates for: ${address}. Using fallback location.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Geocoding Error",
        description: `API error for: ${address}. Using fallback location.`,
        variant: "destructive"
      });
    }

    // Fallback coordinates (Miami, FL)
    console.log(`Using fallback coordinates for: ${address}`);
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

          const distance = Math.round(summary.lengthInMeters * 0.000621371); // Convert to miles
          const duration = Math.round(summary.travelTimeInSeconds / 60); // Convert to minutes

          // Display route on map
          if (map) {
            // Clear existing markers and routes
            mapMarkers.forEach((marker: any) => marker.remove());
            setMapMarkers([]);

            // Remove existing route layers
            if (map.getSource('route')) {
              map.removeLayer('route');
              map.removeSource('route');
            }

            // Add origin marker
            const originMarker = new tt.Marker({ color: 'green' })
              .setLngLat([originCoords.lng, originCoords.lat])
              .setPopup(new tt.Popup().setHTML(`<strong>Origin:</strong><br>${origin}`))
              .addTo(map);

            // Add destination marker
            const destMarker = new tt.Marker({ color: 'red' })
              .setLngLat([destCoords.lng, destCoords.lat])
              .setPopup(new tt.Popup().setHTML(`<strong>Destination:</strong><br>${destination}`))
              .addTo(map);

            setMapMarkers([originMarker, destMarker]);

            // Add route line
            const routeGeoJson = route.legs[0].points.map((point: any) => [point.longitude, point.latitude]);

            // Add the route as a source first
            map.addSource('truck-route', {
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                  'type': 'LineString',
                  'coordinates': routeGeoJson
                }
              }
            });

            // Then add the layer
            map.addLayer({
              'id': 'truck-route',
              'type': 'line',
              'source': 'truck-route',
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
            routeGeoJson.forEach((coord: [number, number]) => bounds.extend(coord));
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
    const R = 3959; // Radio de la Tierra en millas (cambio de km a millas)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const displayRouteOnMap = async (route: RouteType) => {
    if (!map || !isTomTomLoaded) {
      console.log('Map not ready. Map:', !!map, 'TomTom loaded:', isTomTomLoaded);
      toast({
        title: "Mapa no disponible",
        description: "El mapa no está listo. Por favor espera un momento.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Displaying route:', route);
      console.log('Coordinates:', {
        originLng: route.originLng,
        originLat: route.originLat,
        destLng: route.destinationLng,
        destLat: route.destinationLat
      });

      // Validate coordinates
      if (!route.originLng || !route.originLat || !route.destinationLng || !route.destinationLat) {
        console.error('Missing coordinates for route', route);
        toast({
          title: "Error",
          description: "Esta ruta no tiene coordenadas válidas. Por favor recrea la ruta.",
          variant: "destructive"
        });
        return;
      }

      // Clear existing markers
      mapMarkers.forEach(marker => marker.remove());
      setMapMarkers([]);

      // Remove existing route layers safely
      try {
        if (map.getLayer('route')) {
          map.removeLayer('route');
        }
      } catch (e) {
        console.log('Layer route does not exist');
      }
      
      try {
        if (map.getSource('route')) {
          map.removeSource('route');
        }
      } catch (e) {
        console.log('Source route does not exist');
      }

      try {
        if (map.getLayer('truck-route')) {
          map.removeLayer('truck-route');
        }
      } catch (e) {
        console.log('Layer truck-route does not exist');
      }
      
      try {
        if (map.getSource('truck-route')) {
          map.removeSource('truck-route');
        }
      } catch (e) {
        console.log('Source truck-route does not exist');
      }

      // Add markers and store them
      const originMarker = new tt.Marker({ color: 'green' })
        .setLngLat([route.originLng, route.originLat])
        .setPopup(new tt.Popup().setHTML(`<strong>Origin:</strong><br>${route.origin}`))
        .addTo(map);

      const destMarker = new tt.Marker({ color: 'red' })
        .setLngLat([route.destinationLng, route.destinationLat])
        .setPopup(new tt.Popup().setHTML(`<strong>Destination:</strong><br>${route.destination}`))
        .addTo(map);

      setMapMarkers([originMarker, destMarker]);

      // Calculate and display route using TomTom API directly with exact truck specifications
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

      // Convert specifications to metric system for TomTom API
      const vehicleWeightKg = Math.round(80000 * 0.453592); // 80,000 lbs to kg = 36,287 kg
      const vehicleAxleWeightKg = Math.round(20000 * 0.453592); // 20,000 lbs to kg = 9,072 kg  
      const vehicleLengthM = Math.round(65 * 0.3048 * 10) / 10; // 65 ft to meters = 19.8 m
      const vehicleWidthM = Math.round(7.5 * 0.3048 * 10) / 10; // 7.5 ft to meters = 2.3 m
      const vehicleHeightM = Math.round(13.5 * 0.3048 * 10) / 10; // 13.5 ft to meters = 4.1 m
      const vehicleMaxSpeedKmh = Math.round(80 * 1.60934); // 80 mph to km/h = 129 km/h

      const routingApiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${route.originLat},${route.originLng}:${route.destinationLat},${route.destinationLng}/json?key=${apiKey}&vehicleCommercial=true&vehicleMaxSpeed=${vehicleMaxSpeedKmh}&vehicleWeight=${vehicleWeightKg}&vehicleAxleWeight=${vehicleAxleWeightKg}&vehicleLength=${vehicleLengthM}&vehicleWidth=${vehicleWidthM}&vehicleHeight=${vehicleHeightM}&travelMode=truck&unitSystem=imperial&sectionType=state`;

      console.log('Calculating truck route with exact specifications:');
      console.log(`- Weight: ${vehicleWeightKg} kg (80,000 lbs)`);
      console.log(`- Axle Weight: ${vehicleAxleWeightKg} kg (20,000 lbs)`);
      console.log(`- Length: ${vehicleLengthM} m (65 ft)`);
      console.log(`- Width: ${vehicleWidthM} m (7.5 ft)`);
      console.log(`- Height: ${vehicleHeightM} m (13.5 ft)`);
      console.log(`- Max Speed: ${vehicleMaxSpeedKmh} km/h (80 mph)`);

      const routeResponse = await fetch(routingApiUrl);
      const routeData = await routeResponse.json();

      console.log('Route calculation response:', routeData);

      if (routeData.routes && routeData.routes.length > 0) {
        const routeInfo = routeData.routes[0];
        const routeGeoJson = routeInfo.legs[0].points.map((point: any) => [point.longitude, point.latitude]);

        // Extract route summary information in miles
        const totalDistanceMiles = Math.round((routeInfo.summary.lengthInMeters * 0.000621371) * 10) / 10; // Convert meters to miles
        const totalTimeDuration = Math.round(routeInfo.summary.travelTimeInSeconds / 60); // Convert to minutes

        // Process sections to get state-by-state breakdown
        const stateBreakdown: Array<{state: string, miles: number}> = [];

        if (routeInfo.sections && routeInfo.sections.length > 0) {
          console.log('Processing route sections:', routeInfo.sections);
          
          routeInfo.sections.forEach((section: any, index: number) => {
            console.log(`Section ${index}:`, section);
            
            // TomTom sections can have different structures depending on the response
            const sectionMiles = Math.round((section.lengthInMeters * 0.000621371) * 10) / 10;
            
            // Try to get state name from different possible fields
            let stateName = section.state || section.countrySubdivision || section.administrativeArea;
            
            if (stateName && sectionMiles > 0) {
              // Check if state already exists in breakdown
              const existingStateIndex = stateBreakdown.findIndex(item => item.state === stateName);
              if (existingStateIndex >= 0) {
                stateBreakdown[existingStateIndex].miles += sectionMiles;
                stateBreakdown[existingStateIndex].miles = Math.round(stateBreakdown[existingStateIndex].miles * 10) / 10;
              } else {
                stateBreakdown.push({
                  state: stateName,
                  miles: sectionMiles
                });
              }
            }
          });
        }
        
        // If no state breakdown available, try to estimate based on coordinates
        if (stateBreakdown.length === 0) {
          console.log('No state sections found, creating estimated breakdown');
          // For now, assign all miles to a general entry
          stateBreakdown.push({
            state: 'Multiple States',
            miles: totalDistanceMiles
          });
        }
        
        console.log('Final state breakdown:', stateBreakdown);

        // Update route in storage with calculated information
        try {
          const response = await fetch(`/api/routes/${route.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              totalMiles: totalDistanceMiles,
              estimatedDuration: totalTimeDuration,
              stateBreakdown: JSON.stringify(stateBreakdown)
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update route');
          }

          // Refetch routes to update the UI
          queryClient.invalidateQueries({ queryKey: ['/api/routes'] });

          console.log(`Route updated: ${totalDistanceMiles} miles, ${totalTimeDuration} minutes`);
          console.log('State breakdown:', stateBreakdown);

        } catch (error) {
          console.error('Failed to update route with calculated data:', error);
        }

        // Add the route as a source and layer
        map.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': routeGeoJson
            }
          }
        });

        map.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
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

        // Fit map to route bounds with validation
        const bounds = new tt.LngLatBounds();
        routeGeoJson.forEach((coord: [number, number]) => {
          // Check if latitude and longitude are valid numbers
          if (typeof coord[1] === 'number' && !isNaN(coord[1]) &&
              typeof coord[0] === 'number' && !isNaN(coord[0])) {
            bounds.extend(coord);
          } else {
            console.error("Invalid coordinate found:", coord);
          }
        });
        map.fitBounds(bounds, { padding: 50 });

        toast({
          title: "Ruta mostrada",
          description: `Ruta "${route.name}" ahora visible en el mapa`,
        });

      } else {
        console.log('No route data available from TomTom API');
        toast({
          title: "Error",
          description: "No se pudo obtener los datos de la ruta desde TomTom",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error displaying route:", error);
      toast({
        title: "Error",
        description: "Error al mostrar la ruta en el mapa",
        variant: "destructive"
      });
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

      <Tabs defaultValue="create" className="space-y-4" onValueChange={handleTabChange}>
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
                          {route.totalMiles ? (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {route.totalMiles} millas
                            </div>
                          ) : route.distance && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {Math.round(route.distance * 0.621371)} millas (convertido)
                            </div>
                          )}
                          {route.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                            </div>
                          )}
                        </div>
                        
                        {/* Estado breakdown section */}
                        {route.stateBreakdown && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Millas por Estado:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {(() => {
                                try {
                                  const breakdown = JSON.parse(route.stateBreakdown);
                                  return breakdown.map((stateInfo: {state: string, miles: number}, index: number) => (
                                    <div key={index} className="flex justify-between text-sm bg-white p-2 rounded">
                                      <span className="text-gray-600">{stateInfo.state}:</span>
                                      <span className="font-medium text-blue-600">{stateInfo.miles} mi</span>
                                    </div>
                                  ));
                                } catch (error) {
                                  console.error('Error parsing state breakdown:', error);
                                  return <div className="text-sm text-red-500">Error al mostrar desglose por estado</div>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
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
                <div className="lg:col-span-2 relative">
                  <div 
                    ref={mapRef}
                    className="h-96 w-full rounded-lg border"
                    style={{ minHeight: '400px' }}
                  />
                  {!isTomTomLoaded && (
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
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
                            onClick={() => {
                              console.log('Displaying route on map:', route);
                              displayRouteOnMap(route);
                              setSelectedRoute(route);
                            }}
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{route.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {route.origin} → {route.destination}
                              </p>
                              {route.totalMiles && (
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    <strong>{route.totalMiles} millas</strong> (Optimizado para Camión)
                                  </p>
                                  {route.estimatedDuration && (
                                    <p className="text-xs text-muted-foreground">
                                      Estimado: {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                                    </p>
                                  )}
                                  {route.stateBreakdown && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Millas por Estado:</p>
                                      <div className="space-y-1">
                                        {(() => {
                                          try {
                                            const breakdown = JSON.parse(route.stateBreakdown);
                                            return breakdown.map((stateInfo: {state: string, miles: number}, index: number) => (
                                              <div key={index} className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">{stateInfo.state}:</span>
                                                <span className="font-medium">{stateInfo.miles} millas</span>
                                              </div>
                                            ));
                                          } catch (error) {
                                            console.error('Error parsing state breakdown:', error);
                                            return <div className="text-xs text-red-500">Error en desglose</div>;
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {!route.totalMiles && route.distance && (
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(route.distance * 0.621371)} millas (convertido de km)
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
                      <p className="font-medium mb-2">Especificaciones del Camión:</p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground mb-3">
                        <div>Largo: 65 pies</div>
                        <div>Alto: 13'6"</div>
                        <div>Ancho: 7'6"</div>
                        <div>Peso: 80,000 lbs</div>
                      </div>
                      <p className="font-medium mb-1">Características TomTom:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Restricciones de peso y altura</li>
                        <li>• Optimización de puentes</li>
                        <li>• Rutas para vehículos comerciales</li>
                        <li>• Seguimiento de millas por estado</li>
                        <li>• Opciones de rutas ecológicas</li>
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