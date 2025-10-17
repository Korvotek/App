"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { fetchAllContaAzulCustomers } from "@/lib/integrations/conta-azul/customers";
import { CONTA_AZUL_PROVIDER } from "@/lib/integrations/conta-azul";
import { findTenantIntegrationToken } from "@/lib/integrations/storage";
import type { Database, Json } from "@/lib/supabase/database.types";

const LOG_PREFIX = "[actions/conta-azul-customers]";

type ContaAzulCustomerRow =
  Database["public"]["Tables"]["conta_azul_customers"]["Row"];

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta && Object.keys(meta).length > 0) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

export interface SyncContaAzulCustomersResult {
  success: boolean;
  syncedCount: number;
}

export async function syncContaAzulCustomers(): Promise<SyncContaAzulCustomersResult> {
  const { supabase, tenantId, user } = await getCurrentUserAndTenant();

  const tokenRow = await findTenantIntegrationToken({
    supabase,
    tenantId,
    provider: CONTA_AZUL_PROVIDER,
  });

  if (!tokenRow?.access_token) {
    throw new Error(
      "Nenhum token da Conta Azul encontrado. Conecte a integração antes de sincronizar.",
    );
  }

  const existingMetadata =
    (tokenRow.metadata as Record<string, unknown> | null) ?? {};

  const syncTimestamp = new Date().toISOString();
  let metadataUpdated = false;

  try {
    const customers = await fetchAllContaAzulCustomers(tokenRow.access_token, {
      includeAddress: true,
      pageSize: 100,
      profile: "Cliente",
      maxPages: 50,
    });

    logDebug("Fetched Conta Azul customers", {
      count: customers.length,
      tenantId,
    });

    if (customers.length > 0) {
      const records: Omit<
        ContaAzulCustomerRow,
        "id" | "created_at" | "updated_at"
      >[] = customers.map((customer) => {
        const address = (customer.endereco ??
          {}) as Record<string, unknown>;

        const activeValue =
          typeof customer.ativo === "boolean"
            ? customer.ativo
            : customer.ativo === null
              ? null
              : null;

        return {
          tenant_id: tenantId,
          external_id: String(customer.id),
          name:
            typeof customer.nome === "string" && customer.nome.trim() !== ""
              ? customer.nome
              : typeof customer.nome_fantasia === "string" &&
                  customer.nome_fantasia.trim() !== ""
                ? customer.nome_fantasia
                : null,
          person_type:
            typeof customer.tipo_pessoa === "string"
              ? customer.tipo_pessoa
              : null,
          document:
            typeof customer.documento === "string"
              ? customer.documento
              : null,
          email:
            typeof customer.email === "string" ? customer.email : null,
          phone:
            typeof customer.telefone === "string"
              ? customer.telefone
              : null,
          city:
            typeof address.cidade === "string" ? address.cidade : null,
          state:
            typeof address.estado === "string" ? address.estado : null,
          country:
            typeof address.pais === "string" ? address.pais : null,
          postal_code:
            typeof address.cep === "string" ? address.cep : null,
          active: activeValue,
          synced_at: syncTimestamp,
          raw_payload: customer as unknown as Json,
        };
      });

      const chunkSize = 100;
      for (let index = 0; index < records.length; index += chunkSize) {
        const chunk = records.slice(index, index + chunkSize);
        const { error } = await supabase
          .from("conta_azul_customers")
          .upsert(chunk, {
            onConflict: "tenant_id,external_id",
            ignoreDuplicates: false,
          });

        if (error) {
          throw new Error(
            `Erro ao salvar clientes sincronizados: ${error.message}`,
          );
        }
      }
    }

    const metadataPayload = {
      ...existingMetadata,
      last_synced_at: syncTimestamp,
      last_sync_by: user.id,
      last_sync_count: customers.length,
      last_sync_status: "success",
      last_sync_error: null,
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
      entity_id: CONTA_AZUL_PROVIDER,
      success: true,
      metadata: {
        provider: CONTA_AZUL_PROVIDER,
        synced_count: customers.length,
        source: "conta_azul_customers",
        synced_at: syncTimestamp,
      } as Json,
    });

    revalidatePath("/dashboard/clientes");
    revalidatePath("/dashboard/integracoes");

    return {
      success: true,
      syncedCount: customers.length,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha desconhecida ao sincronizar clientes da Conta Azul";

    if (!metadataUpdated) {
      const metadataPayload = {
        ...existingMetadata,
        last_sync_status: "error",
        last_sync_error: message,
        last_sync_by: user.id,
        last_sync_attempt_at: syncTimestamp,
      };

      await supabase
        .from("integration_tokens")
        .update({
          metadata: metadataPayload as Json,
        })
        .eq("id", tokenRow.id);
    }

    logDebug("Conta Azul customers sync failed", { message, tenantId });
    throw error;
  }
}

export interface ListContaAzulCustomersInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListContaAzulCustomersResult {
  customers: ContaAzulCustomerRow[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export async function listContaAzulCustomers(
  params: ListContaAzulCustomersInput = {},
): Promise<ListContaAzulCustomersResult> {
  const { page = 1, limit = 25, search } = params;
  const { supabase, tenantId } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let baseQuery = supabase
    .from("conta_azul_customers")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId);

  if (search && search.trim() !== "") {
    const normalized = search.trim();
    baseQuery = baseQuery.or(
      `name.ilike.%${normalized}%,document.ilike.%${normalized}%,email.ilike.%${normalized}%`,
    );
  }

  const { data, error, count } = await baseQuery
    .order("name", { ascending: true, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw new Error(
      `Nao foi possivel recuperar os clientes sincronizados: ${error.message}`,
    );
  }

  return {
    customers: data ?? [],
    totalCount: count ?? 0,
    currentPage: page,
    totalPages: Math.max(Math.ceil((count ?? 0) / limit), 1),
    limit,
  };
}

