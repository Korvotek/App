import { useQuery } from "@tanstack/react-query";
import { getActivityLogs, getUsersForFilter } from "@/actions/audit-actions";

export interface UseActivityLogsOptions {
  page?: number;
  limit?: number;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  enabled?: boolean;
}

export function useActivityLogs({
  page = 1,
  limit = 20,
  actionType,
  dateFrom,
  dateTo,
  userId,
  enabled = true
}: UseActivityLogsOptions = {}) {
  return useQuery({
    queryKey: ["activity-logs", page, limit, actionType, dateFrom, dateTo, userId],
    queryFn: () => getActivityLogs(
      page,
      limit,
      actionType !== "all" ? actionType : undefined,
      dateFrom || undefined,
      dateTo || undefined,
      userId !== "all" ? userId : undefined
    ),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos (logs mudam mais frequentemente)
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useUsersForFilter() {
  return useQuery({
    queryKey: ["users-for-filter"],
    queryFn: getUsersForFilter,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}
