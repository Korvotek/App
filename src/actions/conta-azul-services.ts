"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { fetchAllContaAzulServices } from "@/lib/integrations/conta-azul/services";
import { CONTA_AZUL_PROVIDER } from "@/lib/integrations/conta-azul";
import { findTenantIntegrationToken } from "@/lib/integrations/storage";
import type { Database, Json } from "@/lib/supabase/database.types";

const LOG_PREFIX = "[actions/conta-azul-services]";

type ContaAzulServiceRow =
  Database["public"]["Tables"]["conta_azul_services"]["Row"];

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta && Object.keys(meta).length > 0) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

export interface SyncContaAzulServicesResult {
  success: boolean;
  syncedCount: number;
}

export async function syncContaAzulServices(): Promise<SyncContaAzulServicesResult> {
  const { supabase, tenantId, user } = await getCurrentUserAndTenant();

  const tokenRow = await findTenantIntegrationToken({
    supabase,
    tenantId,
    provider: CONTA_AZUL_PROVIDER,
  });

  if (!tokenRow?.access_token) {
    throw new Error(
      "Nenhum token da Conta Azul encontrado. Conecte a integração antes de sincronizar serviços.",
    );
  }

  const existingMetadata =
    (tokenRow.metadata as Record<string, unknown> | null) ?? {};

  const syncTimestamp = new Date().toISOString();
  let metadataUpdated = false;

  try {
    const services = await fetchAllContaAzulServices(tokenRow.access_token, {
      pageSize: 100,
      maxPages: 100,
    });

    logDebug("Fetched Conta Azul services", {
      count: services.length,
      tenantId,
    });

    if (services.length > 0) {
      const records: Omit<
        ContaAzulServiceRow,
        "id" | "created_at" | "updated_at"
      >[] = services.map((service) => ({
        tenant_id: tenantId,
        external_id: service.id,
        legacy_id:
          typeof service.id_servico === "number" ? service.id_servico : null,
        external_code:
          typeof service.id_externo === "string" ? service.id_externo : null,
        code:
          typeof service.codigo === "string" ? service.codigo : null,
        description:
          typeof service.descricao === "string" ? service.descricao : null,
        service_type:
          typeof service.tipo_servico === "string"
            ? service.tipo_servico
            : null,
        status:
          typeof service.status === "string" ? service.status : null,
        price:
          typeof service.preco === "number" ? service.preco : null,
        cost:
          typeof service.custo === "number" ? service.custo : null,
        cnae_code:
          typeof service.codigo_cnae === "string"
            ? service.codigo_cnae
            : null,
        municipality_code:
          typeof service.codigo_municipio_servico === "string"
            ? service.codigo_municipio_servico
            : null,
        lei_116:
          typeof service.lei_116 === "string" ? service.lei_116 : null,
        synced_at: syncTimestamp,
        raw_payload: service as unknown as Json,
      }));

      const chunkSize = 100;
      for (let index = 0; index < records.length; index += chunkSize) {
        const chunk = records.slice(index, index + chunkSize);

        const { error } = await supabase
          .from("conta_azul_services")
          .upsert(chunk, {
            onConflict: "tenant_id,external_id",
            ignoreDuplicates: false,
          });

        if (error) {
          throw new Error(
            `Erro ao salvar serviços sincronizados: ${error.message}`,
          );
        }
      }
    }

    const metadataPayload = {
      ...existingMetadata,
      last_services_synced_at: syncTimestamp,
      last_services_sync_by: user.id,
      last_services_sync_count: services.length,
      last_services_sync_status: "success",
      last_services_sync_error: null,
    };

    const { error: metadataError } = await supabase
      .from("integration_tokens")
      .update({
        metadata: metadataPayload as Json,
      })
      .eq("id", tokenRow.id);

    if (metadataError) {
      throw new Error(
        `Falha ao atualizar metadados da integração: ${metadataError.message}`,
      );
    }

    metadataUpdated = true;

    await supabase.from("activity_logs").insert({
      tenant_id: tenantId,
      user_id: user.id,
      action_type: "IMPORT_DATA",
      entity_type: "integration",
      entity_id: `${CONTA_AZUL_PROVIDER}_services`,
      success: true,
      metadata: {
        provider: CONTA_AZUL_PROVIDER,
        synced_count: services.length,
        source: "conta_azul_services",
        synced_at: syncTimestamp,
      } as Json,
    });

    revalidatePath("/dashboard/servicos");
    revalidatePath("/dashboard/integracoes");

    return {
      success: true,
      syncedCount: services.length,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha desconhecida ao sincronizar serviços da Conta Azul";

    if (!metadataUpdated) {
      const metadataPayload = {
        ...existingMetadata,
        last_services_sync_status: "error",
        last_services_sync_error: message,
        last_services_sync_by: user.id,
        last_services_sync_attempt_at: syncTimestamp,
      };

      await supabase
        .from("integration_tokens")
        .update({
          metadata: metadataPayload as Json,
        })
        .eq("id", tokenRow.id);
    }

    logDebug("Conta Azul services sync failed", { message, tenantId });
    throw error;
  }
}

export interface ListContaAzulServicesInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListContaAzulServicesResult {
  services: ContaAzulServiceRow[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export async function listContaAzulServices(
  params: ListContaAzulServicesInput = {},
): Promise<ListContaAzulServicesResult> {
  const { page = 1, limit = 25, search } = params;
  const { supabase, tenantId } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let baseQuery = supabase
    .from("conta_azul_services")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId);

  if (search && search.trim() !== "") {
    const normalized = search.trim();
    baseQuery = baseQuery.or(
      `description.ilike.%${normalized}%,code.ilike.%${normalized}%,external_code.ilike.%${normalized}%`,
    );
  }

  const { data, error, count } = await baseQuery
    .order("synced_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw new Error(
      `Nao foi possivel recuperar os serviços sincronizados: ${error.message}`,
    );
  }

  return {
    services: data ?? [],
    totalCount: count ?? 0,
    currentPage: page,
    totalPages: Math.max(Math.ceil((count ?? 0) / limit), 1),
    limit,
  };
}

