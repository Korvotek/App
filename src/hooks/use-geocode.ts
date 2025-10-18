"use client";

import { useState, useEffect } from "react";
import { GOOGLE_MAPS_CONFIG } from "@/lib/google-maps-config";
import { geocodeViaCEP, buildAddressFromViaCEP } from "@/lib/viacep";

interface GeocodeResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export function useGeocode(address: string) {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || address === "Endereço não informado") {
      setResult(null);
      return;
    }

    const geocodeAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Buscando geocodificação para:", address);
        
        // Estratégias de busca mais agressivas
        const addressVariations = [
          address, // Endereço completo
          address.replace(/,/g, " "), // Sem vírgulas
          address.split(",").slice(0, 4).join(","), // Sem CEP
          address.split(",").slice(0, 3).join(","), // Apenas cidade, estado, CEP
          address.split(",").slice(0, 2).join(","), // Apenas cidade, estado
          address.split(",").slice(-2).join(","), // Apenas estado e CEP
          address.split(",").slice(-1)[0], // Apenas CEP
          "São Paulo, SP, Brasil", // Fallback para cidade
        ];

        for (const addressToTry of addressVariations) {
          if (!addressToTry.trim()) continue;
          
          console.log("Tentando endereço:", addressToTry);
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              addressToTry
            )}&key=${GOOGLE_MAPS_CONFIG.geocodeApiKey}&region=BR`
          );

          const data = await response.json();
          console.log("Resposta da API:", data);

          if (data.status === "OK" && data.results && data.results.length > 0) {
            console.log("✅ Sucesso com:", addressToTry);
            setResult(data.results[0]);
            setIsLoading(false);
            return;
          } else {
            console.log("❌ Falhou:", addressToTry, data.status, data.error_message);
          }
        }

        // Se nenhuma variação funcionou, tentar ViaCEP
        console.log("Tentando ViaCEP como fallback");
        const cepMatch = address.match(/\d{5}-?\d{3}/);
        if (cepMatch) {
          const cep = cepMatch[0];
          console.log("Tentando buscar CEP no ViaCEP:", cep);
          
          const viaCEPResult = await geocodeViaCEP(cep);
          if (viaCEPResult) {
            const viaCEPAddress = buildAddressFromViaCEP(viaCEPResult);
            console.log("ViaCEP encontrou:", viaCEPAddress);
            
            // Tentar Google Maps com o endereço do ViaCEP
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                viaCEPAddress
              )}&key=${GOOGLE_MAPS_CONFIG.geocodeApiKey}&region=BR`
            );
            
            const data = await response.json();
            if (data.status === "OK" && data.results && data.results.length > 0) {
              console.log("✅ Sucesso com ViaCEP + Google Maps");
              setResult(data.results[0]);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Último recurso: coordenadas aproximadas de São Paulo
        console.log("Usando coordenadas aproximadas de São Paulo");
        const fallbackResult = {
          formatted_address: address,
          place_id: "fallback",
          geometry: {
            location: {
              lat: -23.5505,
              lng: -46.6333
            }
          },
          address_components: []
        };
        
        setResult(fallbackResult);
        setError("Endereço não encontrado, usando localização aproximada de São Paulo");
        
      } catch (err) {
        setError("Erro ao buscar localização");
        console.error("Erro na geocodificação:", err);
      } finally {
        setIsLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  return { result, isLoading, error };
}
