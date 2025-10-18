import { useQuery } from "@tanstack/react-query";
import { getWorkers } from "@/actions/worker-actions";

export interface UseWorkersOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export function useWorkers({ 
  page = 1, 
  limit = 12, 
  search,
  enabled = true 
}: UseWorkersOptions = {}) {
  return useQuery({
    queryKey: ["workers", page, limit, search],
    queryFn: () => getWorkers(page, limit, search),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useWorkersInfinite() {
  return useQuery({
    queryKey: ["workers", "infinite"],
    queryFn: () => getWorkers(1, 1000), // Buscar todos para filtros
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
