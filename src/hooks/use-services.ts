import { useQuery } from "@tanstack/react-query";
import { listContaAzulServices } from "@/actions/conta-azul-services";

export interface UseServicesOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export function useServices({
  page = 1,
  limit = 10,
  search = "",
  enabled = true
}: UseServicesOptions = {}) {
  return useQuery({
    queryKey: ["services", page, limit, search],
    queryFn: () => listContaAzulServices({
      page,
      limit,
      search: search.trim(),
    }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

