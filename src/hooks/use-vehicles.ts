import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/actions/vehicle-actions";

export interface UseVehiclesOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useVehicles({ 
  page = 1, 
  limit = 12, 
  enabled = true 
}: UseVehiclesOptions = {}) {
  return useQuery({
    queryKey: ["vehicles", page, limit],
    queryFn: () => getVehicles(page, limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useVehiclesInfinite() {
  return useQuery({
    queryKey: ["vehicles", "infinite"],
    queryFn: () => getVehicles(1, 1000), // Buscar todos para filtros
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
