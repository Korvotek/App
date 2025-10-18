"use client";

import { useEffect, useState } from "react";
import { useGeocode } from "@/hooks/use-geocode";

interface StaticMapProps {
  address: string;
  className?: string;
}

export function StaticMap({ address, className = "" }: StaticMapProps) {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { result: geocodeResult, isLoading: isGeocodeLoading, error: geocodeError } = useGeocode(address);

  useEffect(() => {
    setIsMapLoading(isGeocodeLoading);
    setError(geocodeError);
  }, [isGeocodeLoading, geocodeError]);

  const isLoading = isGeocodeLoading || isMapLoading;
  const hasError = geocodeError || error;

  if (hasError && !geocodeResult) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-600 mb-2">{hasError}</p>
          <p className="text-xs text-gray-500">Endereço: {address}</p>
          <p className="text-xs text-gray-500 mt-1">
            Verifique se o endereço está correto ou tente um formato diferente
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (!geocodeResult) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-600">Endereço não encontrado</p>
          <p className="text-xs text-gray-500">Endereço: {address}</p>
        </div>
      </div>
    );
  }

  const { lat, lng } = geocodeResult.geometry.location;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x400&markers=color:red%7C${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  return (
    <div className={`relative ${className}`}>
      <img
        src={mapUrl}
        alt={`Mapa de ${address}`}
        className="w-full h-full rounded-lg object-cover"
        onLoad={() => setIsMapLoading(false)}
        onError={() => {
          setError("Erro ao carregar imagem do mapa");
          setIsMapLoading(false);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}
