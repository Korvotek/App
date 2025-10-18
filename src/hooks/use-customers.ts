import { useQuery } from "@tanstack/react-query";

export interface UseCustomersOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export function useCustomers({
  page = 1,
  limit = 10,
  search = "",
  enabled = true
}: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: ["customers", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }

      return response.json();
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

