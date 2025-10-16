import { createServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }
  
  return user;
}

export async function getCurrentTenantId() {
  const user = await getCurrentUser();
  const supabase = await createServerClient();
  
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userDataError || !userData?.tenant_id) {
    throw new Error("Tenant não encontrado");
  }

  return userData.tenant_id;
}

export async function getCurrentUserAndTenant() {
  const user = await getCurrentUser();
  const supabase = await createServerClient();
  
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userDataError || !userData?.tenant_id) {
    throw new Error("Tenant não encontrado");
  }

  return {
    user,
    tenantId: userData.tenant_id,
    supabase,
  };
}
