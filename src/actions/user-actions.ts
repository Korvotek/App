"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import type { Database } from "@/lib/supabase/database.types";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function getUsers(page: number = 1, limit: number = 12, search?: string) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let countQuery = supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("active", true);

  let dataQuery = supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      role,
      active,
      last_login_at,
      last_activity_at,
      created_at,
      picture_url
    `)
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    countQuery = countQuery.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm},role.ilike.${searchTerm}`);
    dataQuery = dataQuery.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm},role.ilike.${searchTerm}`);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    return null;
  }

  const { data: users, error } = await dataQuery;

  if (error) {
    return null;
  }

  return {
    users: users || [],
    totalCount: totalCount || 0,
    totalPages: Math.ceil((totalCount || 0) / limit),
    currentPage: page,
    limit,
  };
}

export async function updateUserRole(userId: string, newRole: "ADMIN" | "OPERATOR" | "VIEWER") {
  const { user, tenantId, supabase } = await getCurrentUserAndTenant();

  const updateData: UserUpdate = {
    role: newRole,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(`Erro ao atualizar role do usuário: ${error.message}`);
  }

  await supabase.from("activity_logs").insert({
    tenant_id: tenantId,
    user_id: user.id,
    action_type: "UPDATE_EMPLOYEE",
    entity_id: userId,
    entity_type: "user",
    success: true,
    metadata: {
      new_role: newRole,
    },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true, message: "Role do usuário atualizado com sucesso!" };
}

export async function deactivateUser(userId: string) {
  const { user, tenantId, supabase } = await getCurrentUserAndTenant();

  const { error } = await supabase
    .from("users")
    .update({ 
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(`Erro ao desativar usuário: ${error.message}`);
  }

  await supabase.from("activity_logs").insert({
    tenant_id: tenantId,
    user_id: user.id,
    action_type: "DELETE_EMPLOYEE",
    entity_id: userId,
    entity_type: "user",
    success: true,
    metadata: {
      action: "deactivate",
    },
  });

  revalidatePath("/dashboard/usuarios");
  return { success: true, message: "Usuário desativado com sucesso!" };
}
