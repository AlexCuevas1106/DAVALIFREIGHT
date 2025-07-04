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

  // Truck routing parameters - exact specifications
  truckOptions: {
    vehicleMaxSpeed: 80, // mph (converted to km/h in API calls)
    vehicleWeight: 80000, // lbs (converted to kg in API calls: 36287 kg)
    vehicleAxleWeight: 20000, // lbs per axle (converted to kg: 9072 kg)
    vehicleLength: 65, // feet (converted to meters: 19.8 m)
    vehicleWidth: 7.5, // feet (converted to meters: 2.3 m) 
    vehicleHeight: 13.5, // feet (converted to meters: 4.1 m)
    vehicleCommercial: true,
    vehicleLoadType: "USHazmatClass2,USHazmatClass8,USHazmatClass9",
  },
};
