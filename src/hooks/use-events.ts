import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/actions/event-actions";
import type { EventFilters } from "@/lib/validations/event-schema";

export interface UseEventsOptions {
  page?: number;
  limit?: number;
  filters?: EventFilters;
  enabled?: boolean;
}

export function useEvents({
  page = 1,
  limit = 10,
  filters = {},
  enabled = true
}: UseEventsOptions = {}) {
  return useQuery({
    queryKey: ["events", page, limit, filters],
    queryFn: () => getEvents(page, limit, filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}
