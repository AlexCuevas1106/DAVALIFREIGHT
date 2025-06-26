
// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  // Replace this with your actual Google Maps API key
  // Get your API key from: https://console.cloud.google.com/apis/credentials
  apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE",
  
  // Default map center (USA)
  defaultCenter: { lat: 39.8283, lng: -98.5795 },
  
  // Default zoom level
  defaultZoom: 4,
  
  // Map libraries to load
  libraries: ["places", "geometry"] as const,
};
