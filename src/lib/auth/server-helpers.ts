import { createServerClient } from "@/lib/supabase/server";

const LOG_PREFIX = "[auth/server-helpers]";

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta && Object.keys(meta).length > 0) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

async function getSupabaseContext() {
  const supabase = await createServerClient();

  logDebug("Fetching current auth user");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    logDebug("User not authenticated", { error: userError?.message });
    throw new Error("Usuário não autenticado");
  }

  logDebug("Authenticated user retrieved", { userId: user.id });
  return { supabase, user };
}

async function getTenantIdForUser(supabase: Awaited<ReturnType<typeof createServerClient>>, userId: string) {
  logDebug("Fetching tenant for user", { userId });
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", userId)
    .single();

  if (userDataError || !userData?.tenant_id) {
    logDebug("Tenant not found for user", { userId, error: userDataError?.message });
    throw new Error("Tenant não encontrado");
  }

  logDebug("Tenant resolved for user", { userId, tenantId: userData.tenant_id });
  return userData.tenant_id;
}

export async function getCurrentUser() {
  logDebug("getCurrentUser invoked");
  const { user } = await getSupabaseContext();
  return user;
}

export async function getCurrentTenantId() {
  logDebug("getCurrentTenantId invoked");
  const { supabase, user } = await getSupabaseContext();
  return getTenantIdForUser(supabase, user.id);
}

export async function getCurrentUserAndTenant() {
  logDebug("getCurrentUserAndTenant invoked");
  const { supabase, user } = await getSupabaseContext();
  const tenantId = await getTenantIdForUser(supabase, user.id);

  return {
    user,
    tenantId,
    supabase,
  };
}
