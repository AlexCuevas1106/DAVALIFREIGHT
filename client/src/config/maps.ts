// TomTom Maps configuration for truck routing
export const TOMTOM_CONFIG = {
  // TomTom API key from environment variables
  // Get your API key from: https://developer.tomtom.com/
  apiKey: import.meta.env.VITE_TOMTOM_API_KEY,

  // Default map center (USA)
  defaultCenter: { lat: 39.8283, lng: -98.5795 },

  // Default zoom level
  defaultZoom: 4,

  // TomTom Map style
  mapStyle: "main",

  // Truck routing parameters
  truckOptions: {
    vehicleMaxSpeed: 90, // km/h
    vehicleWeight: 40000, // kg (typical truck weight)
    vehicleAxleWeight: 10000, // kg
    vehicleLength: 16.5, // meters
    vehicleWidth: 2.55, // meters
    vehicleHeight: 4.0, // meters
    vehicleCommercial: true,
    vehicleLoadType: "USHazmatClass2,USHazmatClass8,USHazmatClass9",
  },
};
