export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  geocodeApiKey: process.env.NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY!,
  version: "weekly" as const,
  mapOptions: {
    mapTypeId: "roadmap" as const,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoom: 15,
  },
} as const;
