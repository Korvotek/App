import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/actions/user-actions";

export interface UseUsersOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useUsers({ 
  page = 1, 
  limit = 12, 
  enabled = true 
}: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => getUsers(page, limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useUsersInfinite() {
  return useQuery({
    queryKey: ["users", "infinite"],
    queryFn: () => getUsers(1, 1000), // Buscar todos para filtros
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
