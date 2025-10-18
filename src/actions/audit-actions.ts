"use server";

import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";

export async function getUsersForFilter() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, full_name")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("full_name");

  if (error) {
    return null;
  }

  return users || [];
}

export async function getActivityLogs(
  page: number = 1, 
  limit: number = 20,
  actionType?: string,
  dateFrom?: string,
  dateTo?: string,
  userId?: string
) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("activity_logs")
    .select(`
      id,
      action_type,
      entity_type,
      entity_id,
      success,
      error_message,
      metadata,
      timestamp,
      user_id,
      users!activity_logs_user_id_fkey (
        email,
        full_name
      )
    `)
    .eq("tenant_id", tenantId)
    .order("timestamp", { ascending: false });

  if (actionType && actionType !== "all") {
    query = query.eq("action_type", actionType as "LOGIN" | "LOGOUT" | "CREATE_EVENT" | "UPDATE_EVENT" | "DELETE_EVENT" | "CREATE_CLIENT" | "UPDATE_CLIENT" | "DELETE_CLIENT" | "CREATE_EMPLOYEE" | "UPDATE_EMPLOYEE" | "DELETE_EMPLOYEE" | "CREATE_USER" | "UPDATE_USER" | "DELETE_USER" | "CREATE_MOLIDE_OPERATION" | "UPDATE_MOLIDE_OPERATION" | "DELETE_MOLIDE_OPERATION" | "ASSIGN_DRIVER" | "ASSIGN_VEHICLE" | "EXPORT_DATA" | "IMPORT_DATA");
  }

  if (dateFrom) {
    query = query.gte("timestamp", dateFrom);
  }

  if (dateTo) {
    query = query.lte("timestamp", dateTo);
  }

  if (userId && userId !== "all") {
    query = query.eq("user_id", userId);
  }

  const { count: totalCount, error: countError } = await supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  if (countError) {
    return null;
  }

  const { data: logs, error } = await query.range(from, to);

  if (error) {
    return null;
  }

  return {
    logs: logs || [],
    totalCount: totalCount || 0,
    totalPages: Math.ceil((totalCount || 0) / limit),
    currentPage: page,
    limit,
  };
}

export async function getActivityStats() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const { data: stats, error } = await supabase
    .from("activity_logs")
    .select("action_type, success, timestamp")
    .eq("tenant_id", tenantId)
    .gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
        return null;
    }

  const totalActions = stats?.length || 0;
  const successfulActions = stats?.filter(log => log.success === true).length || 0;
  const failedActions = totalActions - successfulActions;

  const actionTypes = stats?.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalActions,
    successfulActions,
    failedActions,
    successRate: totalActions > 0 ? (successfulActions / totalActions) * 100 : 0,
    actionTypes,
  };
}
