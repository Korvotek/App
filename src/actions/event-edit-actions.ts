"use server";

import { z } from "zod";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";

// Schema para atualização de eventos
const eventUpdateSchema = z.object({
  id: z.string().uuid("ID do evento inválido"),
  title: z.string().min(1, "Título é obrigatório").optional(),
  description: z.string().optional(),
  event_type: z.enum(["UNICO", "INTERMITENTE"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  client_name: z.string().optional(),
  client_document: z.string().optional(),
  client_email: z.string().email("E-mail inválido").optional(),
  client_phone: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_postal_code: z.string().optional(),
});

const cleaningConfigSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  cleaning_start_time: z.string().optional(),
  cleaning_end_time: z.string().optional(),
  cleaning_frequency: z.string().optional(),
  cleaning_days: z.array(z.string()).optional(),
});

const financialDataSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  contract_value: z.number().positive("Valor deve ser positivo").optional(),
  billing_frequency: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "SINGLE"]).optional(),
  installment_count: z.number().int().positive("Número de parcelas deve ser positivo").optional(),
  installment_value: z.number().positive("Valor da parcela deve ser positivo").optional(),
  receipt_dates: z.array(z.string()).optional(),
});

export type EventUpdateData = z.infer<typeof eventUpdateSchema>;
export type CleaningConfigData = z.infer<typeof cleaningConfigSchema>;
export type FinancialData = z.infer<typeof financialDataSchema>;

// Função para buscar detalhes do evento
export async function getEventDetails(eventId: string) {
  try {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();

    // Buscar dados do evento
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        *,
        event_locations (
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code
        ),
        event_services (
          *,
          products_services (
            description,
            item_type,
            service_type
          )
        ),
        event_contracts (
          contract_number,
          contract_value,
          contract_date,
          notes,
          is_primary
        ),
        molide_operations (
          id,
          operation_type,
          operation_date,
          equipment_pcd,
          equipment_standard,
          status
        )
      `)
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (eventError) {
      throw new Error("Evento não encontrado");
    }

    // Buscar dados do cliente se existir
    let clientData = null;
    if (event.client_id) {
      const { data: client } = await supabase
        .from("conta_azul_customers")
        .select("*")
        .eq("id", event.client_id)
        .single();
      
      clientData = client;
    }

    // Combinar dados do evento com dados do cliente
    const eventWithClient = {
      ...event,
      client_name: clientData?.name || event.client_name,
      client_document: clientData?.document || event.client_document,
      client_email: clientData?.email || null,
      client_phone: clientData?.phone || null,
    };

    return eventWithClient;
  } catch (error) {
    console.error("Erro ao buscar detalhes do evento:", error);
    throw new Error("Erro ao buscar detalhes do evento");
  }
}

// Função para buscar logs de auditoria
export async function getEventAuditLogs(eventId: string) {
  try {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();

    const { data: logs, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        users (
          display_name,
          email
        )
      `)
      .eq("entity_type", "events")
      .eq("entity_id", eventId)
      .eq("tenant_id", tenantId)
      .order("timestamp", { ascending: false });

    if (error) {
      throw new Error("Erro ao buscar logs de auditoria");
    }

    return logs || [];
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    throw new Error("Erro ao buscar logs de auditoria");
  }
}

// Função para atualizar evento
export async function updateEvent(data: EventUpdateData) {
  try {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();

    // Validar dados
    const validatedData = eventUpdateSchema.parse(data);

    // Atualizar evento
    const { data: updatedEvent, error } = await supabase
      .from("events")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error("Erro ao atualizar evento");
    }

    // Registrar log de auditoria
    await supabase.from("activity_logs").insert({
      action_type: "UPDATE_EVENT",
      entity_type: "events",
      entity_id: validatedData.id,
      user_id: user.id,
      success: true,
      metadata: {
        old_value: {},
        new_value: validatedData,
        field_name: "event_data"
      },
      tenant_id: tenantId,
    });

    return updatedEvent;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw new Error("Erro ao atualizar evento");
  }
}

// Função para atualizar configuração de limpeza
export async function updateCleaningConfig(data: CleaningConfigData) {
  try {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();

    const validatedData = cleaningConfigSchema.parse(data);

    const { data: updatedEvent, error } = await supabase
      .from("events")
      .update({
        cleaning_start_time: validatedData.cleaning_start_time,
        cleaning_end_time: validatedData.cleaning_end_time,
        cleaning_frequency: validatedData.cleaning_frequency,
        cleaning_days: validatedData.cleaning_days,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.eventId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error("Erro ao atualizar configuração de limpeza");
    }

    return updatedEvent;
  } catch (error) {
    console.error("Erro ao atualizar configuração de limpeza:", error);
    throw new Error("Erro ao atualizar configuração de limpeza");
  }
}

// Função para atualizar dados financeiros
export async function updateFinancialData(data: FinancialData) {
  try {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();

    const validatedData = financialDataSchema.parse(data);

    const { data: updatedEvent, error } = await supabase
      .from("events")
      .update({
        contract_value: validatedData.contract_value,
        billing_frequency: validatedData.billing_frequency,
        installment_count: validatedData.installment_count,
        installment_value: validatedData.installment_value,
        receipt_dates: validatedData.receipt_dates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.eventId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error("Erro ao atualizar dados financeiros");
    }

    return updatedEvent;
  } catch (error) {
    console.error("Erro ao atualizar dados financeiros:", error);
    throw new Error("Erro ao atualizar dados financeiros");
  }
}