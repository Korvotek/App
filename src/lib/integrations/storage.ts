import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { CONTA_AZUL_PROVIDER } from "./conta-azul";

export type IntegrationTokenRow =
  Database["public"]["Tables"]["integration_tokens"]["Row"];

type TypedSupabaseClient = SupabaseClient<Database>;

interface UpsertIntegrationTokenInput {
  supabase: TypedSupabaseClient;
  provider: string;
  tenantId: string;
  userId: string;
  token: {
    accessToken: string;
    refreshToken: string | null;
    tokenType: string;
    scope: string | null;
    expiresAt: string | null;
    raw?: Record<string, unknown>;
  };
  accountSummary?: Record<string, unknown> | null;
}

export async function findTenantIntegrationToken(params: {
  supabase: TypedSupabaseClient;
  provider: string;
  tenantId: string;
}) {
  const { supabase, provider, tenantId } = params;

  const { data, error } = await supabase
    .from("integration_tokens")
    .select(
      "id, provider, access_token, refresh_token, token_type, scope, expires_at, metadata, created_at, updated_at, user_id",
    )
    .eq("provider", provider)
    .contains("metadata", { tenant_id: tenantId })
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data as IntegrationTokenRow | null;
}

export async function upsertTenantIntegrationToken({
  supabase,
  provider,
  tenantId,
  userId,
  token,
  accountSummary,
}: UpsertIntegrationTokenInput) {
  const existing = await findTenantIntegrationToken({
    supabase,
    provider,
    tenantId,
  });

  const existingMetadata =
    (existing?.metadata as Record<string, unknown> | null) ?? null;

  const metadata = {
    tenant_id: tenantId,
    connected_by:
      (existingMetadata?.connected_by as string | undefined) ?? userId,
    connected_at:
      (existingMetadata?.connected_at as string | undefined) ??
      new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
    account_summary:
      accountSummary ??
      (existingMetadata?.account_summary as Record<string, unknown> | null) ??
      null,
    raw_token: token.raw ?? existingMetadata?.raw_token ?? null,
  };

  if (existing) {
    const { error } = await supabase
      .from("integration_tokens")
      .update({
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
        token_type: token.tokenType,
        scope: token.scope,
        expires_at: token.expiresAt,
        metadata,
      })
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return { id: existing.id };
  }

  const { data, error } = await supabase
    .from("integration_tokens")
    .insert({
      provider,
      user_id: userId,
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      token_type: token.tokenType,
      scope: token.scope,
      expires_at: token.expiresAt,
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id };
}

export async function deleteTenantIntegrationToken(params: {
  supabase: TypedSupabaseClient;
  provider?: string;
  tenantId: string;
}) {
  const { supabase, tenantId, provider = CONTA_AZUL_PROVIDER } = params;

  const existing = await findTenantIntegrationToken({
    supabase,
    provider,
    tenantId,
  });

  if (!existing) {
    return { deleted: false };
  }

  const { error } = await supabase
    .from("integration_tokens")
    .delete()
    .eq("id", existing.id);

  if (error) {
    throw error;
  }

  return { deleted: true };
}
