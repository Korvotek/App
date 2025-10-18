"use client";

import { useEffect, useRef, useState } from "react";
import { useGeocode } from "@/hooks/use-geocode";

interface GoogleMapProps {
  address: string;
  className?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
      };
    };
    initMap: () => void;
  }
}

export function GoogleMap({ address, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const { result: geocodeResult, isLoading: isGeocodeLoading, error: geocodeError } = useGeocode(address);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !geocodeResult) return;

      try {
        setIsMapLoading(true);
        setMapError(null);

        // Verificar se o Google Maps já está carregado
        if (!window.google) {
          // Carregar o script do Google Maps
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            createMap();
          };
          
          script.onerror = () => {
            setMapError("Erro ao carregar o Google Maps");
            setIsMapLoading(false);
          };
          
          document.head.appendChild(script);
        } else {
          createMap();
        }

        function createMap() {
          if (!geocodeResult) return;
          
          const location = geocodeResult.geometry.location;
          
          const map = new window.google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 15,
            mapTypeId: 'roadmap',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          new window.google.maps.Marker({
            position: location,
            map: map,
            title: geocodeResult.formatted_address,
          });

          setIsMapLoading(false);
        }
        
      } catch (err) {
        console.error("Erro ao carregar o mapa:", err);
        setMapError("Erro ao carregar o mapa");
        setIsMapLoading(false);
      }
    };

    initMap();
  }, [geocodeResult]);

  const isLoading = isGeocodeLoading || isMapLoading;
  const error = geocodeError || mapError;

  if (error && !geocodeResult) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-600 mb-2">{error}</p>
          <p className="text-xs text-gray-500">Endereço: {address}</p>
          <p className="text-xs text-gray-500 mt-1">
            Verifique se o endereço está correto ou tente um formato diferente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
