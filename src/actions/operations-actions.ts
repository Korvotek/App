"use server";

import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { Database } from "@/lib/supabase/database.types";

type OperationRow = Database["public"]["Tables"]["event_operations"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type PartyRow = Database["public"]["Tables"]["parties"]["Row"];
type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export type OperationWithRelations = OperationRow & {
  events?: {
    title: string;
    event_number: string;
    description: string | null;
    event_locations?: Array<{
      street: string | null;
      number: string | null;
      complement: string | null;
      neighborhood: string | null;
      city: string;
      state: string;
      postal_code: string | null;
    }> | null;
  } | null;
  parties?: Pick<PartyRow, "display_name"> | null;
  vehicles?: Pick<VehicleRow, "license_plate" | "model" | "brand"> | null;
};

export interface GetOperationsOptions {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  status?: string;
  operationId?: string;
}

export interface OperationsResponse<T = OperationRow> {
  operations: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getOperations({
  page = 1,
  limit = 12,
  search,
  eventId,
  status,
  operationId,
}: GetOperationsOptions = {}): Promise<OperationsResponse<OperationWithRelations>> {
  try {
    console.log("🔍 Iniciando getOperations com parâmetros:", { page, limit, search, eventId, status, operationId });
    
    const { tenantId, supabase } = await getCurrentUserAndTenant();
    console.log("✅ Usuário e tenant obtidos:", { tenantId: tenantId.substring(0, 8) + "..." });

    let countQuery = supabase
      .from("event_operations")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    let dataQuery = supabase
      .from("event_operations")
      .select(`
        *,
        events(
          title, 
          event_number, 
          description,
          event_locations!event_locations_event_id_fkey(
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code
          )
        ),
        parties!event_operations_driver_id_fkey(display_name),
        vehicles!event_operations_vehicle_id_fkey(license_plate, model, brand)
      `)
      .eq("tenant_id", tenantId);

    if (operationId) {
      countQuery = countQuery.eq("id", operationId);
      dataQuery = dataQuery.eq("id", operationId);
    }

    if (eventId) {
      countQuery = countQuery.eq("event_id", eventId);
      dataQuery = dataQuery.eq("event_id", eventId);
    }

    if (status) {
      countQuery = countQuery.eq("status", status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING");
      dataQuery = dataQuery.eq("status", status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING");
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      countQuery = countQuery.or(`operation_type.ilike.${searchTerm},notes.ilike.${searchTerm}`);
      dataQuery = dataQuery.or(`operation_type.ilike.${searchTerm},notes.ilike.${searchTerm}`);
    }

    console.log("📊 Executando query de contagem...");
    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("❌ Erro na query de contagem:", countError);
      throw new Error(`Erro ao contar operações: ${countError.message}`);
    }
    console.log("✅ Contagem obtida:", count);

    console.log("📊 Executando query de dados...");
    const { data, error } = await dataQuery
      .order("scheduled_start", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("❌ Erro na query de dados:", error);
      throw new Error(`Erro ao buscar operações: ${error.message}`);
    }
    console.log("✅ Dados obtidos:", data?.length || 0, "registros");

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Verificar se há problemas de serialização
    console.log("🔍 Iniciando serialização dos dados...");
    const serializedData = (data || []).map((operation, index) => {
      try {
        console.log(`🔍 Serializando operação ${index + 1}/${data.length}:`, operation.id);
        
        // Converter datas para strings para evitar problemas de serialização
        const serializedOperation = {
          ...operation,
          scheduled_start: operation.scheduled_start ? new Date(operation.scheduled_start).toISOString() : null,
          scheduled_end: operation.scheduled_end ? new Date(operation.scheduled_end).toISOString() : null,
          created_at: operation.created_at ? new Date(operation.created_at).toISOString() : null,
        };
        
        // Testar serialização
        const serialized = JSON.stringify(serializedOperation);
        console.log(`✅ Operação ${operation.id} serializada com sucesso (${serialized.length} chars)`);
        return serializedOperation;
      } catch (serializationError) {
        console.error("❌ Erro de serialização na operação:", operation.id, serializationError);
        console.error("❌ Dados da operação problemática:", JSON.stringify(operation, null, 2));
        return operation;
      }
    });
    
    console.log("✅ Serialização de todas as operações concluída");

    const result = {
      operations: serializedData as OperationWithRelations[],
      totalCount,
      totalPages,
      currentPage: page,
    };

    console.log("✅ Resultado final:", { 
      operationsCount: result.operations.length, 
      totalCount: result.totalCount, 
      totalPages: result.totalPages 
    });

    // Testar serialização do resultado completo
    try {
      const serializedResult = JSON.stringify(result);
      console.log("✅ Resultado serializado com sucesso");
      
      // Testar deserialização também
      const deserializedResult = JSON.parse(serializedResult);
      console.log("✅ Resultado deserializado com sucesso");
      
      return deserializedResult;
    } catch (serializationError) {
      console.error("❌ Erro de serialização do resultado:", serializationError);
      
      // Retornar resultado simplificado em caso de erro de serialização
      const simplifiedResult = {
        operations: (data || []).map(op => ({
          id: op.id,
          operation_type: op.operation_type,
          status: op.status,
          scheduled_start: op.scheduled_start,
          scheduled_end: op.scheduled_end,
          notes: op.notes,
          driver_id: op.driver_id,
          vehicle_id: op.vehicle_id,
          event_id: op.event_id,
          tenant_id: op.tenant_id,
          created_at: op.created_at,
          events: op.events ? {
            title: op.events.title,
            event_number: op.events.event_number,
            description: op.events.description,
          } : null,
          parties: op.parties ? {
            display_name: op.parties.display_name,
          } : null,
          vehicles: op.vehicles ? {
            license_plate: op.vehicles.license_plate,
            model: op.vehicles.model,
            brand: op.vehicles.brand,
          } : null,
        })) as OperationWithRelations[],
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      };
      
      console.log("✅ Retornando resultado simplificado");
      return simplifiedResult;
    }
  } catch (error) {
    console.error("❌ Erro geral em getOperations:", error);
    console.error("❌ Tipo do erro:", typeof error);
    console.error("❌ Erro é instância de Error:", error instanceof Error);
    console.error("❌ Stack do erro:", error instanceof Error ? error.stack : "N/A");
    console.error("❌ Mensagem do erro:", error instanceof Error ? error.message : String(error));
    console.error("❌ Erro completo:", JSON.stringify(error, null, 2));
    
    // Criar um erro mais informativo
    const enhancedError = new Error(
      `Erro ao buscar operações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
    
    // Adicionar informações extras ao erro
    (enhancedError as any).originalError = error;
    (enhancedError as any).originalErrorType = typeof error;
    (enhancedError as any).originalErrorString = String(error);
    (enhancedError as any).timestamp = new Date().toISOString();
    (enhancedError as any).functionName = 'getOperations';
    
    throw enhancedError;
  }
}

export async function getOperationsSafe({
  page = 1,
  limit = 12,
  search,
  eventId,
  status,
  operationId,
}: GetOperationsOptions = {}): Promise<OperationsResponse<OperationWithRelations>> {
  try {
    console.log("🔍 getOperationsSafe - Iniciando com parâmetros:", { page, limit, search, eventId, status, operationId });
    
    const { tenantId, supabase } = await getCurrentUserAndTenant();
    console.log("✅ getOperationsSafe - Usuário e tenant obtidos");

    // Query básica sem relacionamentos para evitar problemas de serialização
    let dataQuery = supabase
      .from("event_operations")
      .select(`
        id,
        operation_type,
        status,
        scheduled_start,
        scheduled_end,
        notes,
        driver_id,
        vehicle_id,
        event_id,
        tenant_id,
        created_at
      `)
      .eq("tenant_id", tenantId);

    let countQuery = supabase
      .from("event_operations")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    if (operationId) {
      countQuery = countQuery.eq("id", operationId);
      dataQuery = dataQuery.eq("id", operationId);
    }

    if (eventId) {
      countQuery = countQuery.eq("event_id", eventId);
      dataQuery = dataQuery.eq("event_id", eventId);
    }

    if (status) {
      countQuery = countQuery.eq("status", status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING");
      dataQuery = dataQuery.eq("status", status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING");
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      countQuery = countQuery.or(`operation_type.ilike.${searchTerm},notes.ilike.${searchTerm}`);
      dataQuery = dataQuery.or(`operation_type.ilike.${searchTerm},notes.ilike.${searchTerm}`);
    }

    console.log("📊 getOperationsSafe - Executando queries...");
    const { count, error: countError } = await countQuery;
    if (countError) {
      throw new Error(`Erro ao contar operações: ${countError.message}`);
    }

    const { data, error } = await dataQuery
      .order("scheduled_start", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar operações: ${error.message}`);
    }

    console.log("✅ getOperationsSafe - Dados obtidos:", data?.length || 0, "registros");

    // Buscar dados relacionados separadamente para evitar problemas de serialização
    const operations = await Promise.all(
      (data || []).map(async (operation) => {
        const relations: any = {};

        // Buscar evento
        if (operation.event_id) {
          try {
            const { data: eventData, error: eventError } = await supabase
              .from("events")
              .select("title, event_number, description")
              .eq("id", operation.event_id)
              .single();
            
            if (eventError) {
              console.warn(`⚠️ Erro ao buscar evento ${operation.event_id}:`, eventError.message);
            } else {
              // Buscar localizações do evento separadamente
              const { data: eventLocations, error: locationsError } = await supabase
                .from("event_locations")
                .select("street, number, complement, neighborhood, city, state, postal_code")
                .eq("event_id", operation.event_id);
              
              if (locationsError) {
                console.warn(`⚠️ Erro ao buscar localizações do evento ${operation.event_id}:`, locationsError.message);
              }
              
              relations.events = {
                ...eventData,
                event_locations: eventLocations || []
              };
            }
          } catch (eventErr) {
            console.warn(`⚠️ Erro geral ao buscar evento ${operation.event_id}:`, eventErr);
          }
        }

        // Buscar motorista
        if (operation.driver_id) {
          try {
            const { data: driverData, error: driverError } = await supabase
              .from("parties")
              .select("display_name")
              .eq("id", operation.driver_id)
              .single();
            
            if (driverError) {
              console.warn(`⚠️ Erro ao buscar motorista ${operation.driver_id}:`, driverError.message);
            } else {
              relations.parties = driverData;
            }
          } catch (driverErr) {
            console.warn(`⚠️ Erro geral ao buscar motorista ${operation.driver_id}:`, driverErr);
          }
        }

        // Buscar veículo
        if (operation.vehicle_id) {
          try {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from("vehicles")
              .select("license_plate, model, brand")
              .eq("id", operation.vehicle_id)
              .single();
            
            if (vehicleError) {
              console.warn(`⚠️ Erro ao buscar veículo ${operation.vehicle_id}:`, vehicleError.message);
            } else {
              relations.vehicles = vehicleData;
            }
          } catch (vehicleErr) {
            console.warn(`⚠️ Erro geral ao buscar veículo ${operation.vehicle_id}:`, vehicleErr);
          }
        }

        return {
          id: operation.id,
          operation_type: operation.operation_type,
          status: operation.status,
          scheduled_start: operation.scheduled_start ? new Date(operation.scheduled_start).toISOString() : null,
          scheduled_end: operation.scheduled_end ? new Date(operation.scheduled_end).toISOString() : null,
          notes: operation.notes,
          driver_id: operation.driver_id,
          vehicle_id: operation.vehicle_id,
          event_id: operation.event_id,
          tenant_id: operation.tenant_id,
          created_at: operation.created_at ? new Date(operation.created_at).toISOString() : null,
          ...relations,
        } as OperationWithRelations;
      })
    );

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const result = {
      operations,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    };

    console.log("✅ getOperationsSafe - Resultado final:", { 
      operationsCount: result.operations.length, 
      totalCount: result.totalCount, 
      totalPages: result.totalPages 
    });

    return result;
  } catch (error) {
    console.error("❌ getOperationsSafe - Erro:", error);
    throw new Error(`Erro ao buscar operações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function createOperation(formData: FormData): Promise<OperationWithRelations> {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const operationData = {
      tenant_id: tenantId,
      event_id: formData.get("event_id") as string,
      operation_type: formData.get("operation_type") as "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION",
      scheduled_start: formData.get("scheduled_start") as string,
      scheduled_end: formData.get("scheduled_end") as string || null,
      status: formData.get("status") as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
      driver_id: formData.get("driver_id") as string || null,
      vehicle_id: formData.get("vehicle_id") as string || null,
      notes: formData.get("notes") as string || null,
    };

    const { data, error } = await supabase
      .from("event_operations")
      .insert(operationData)
      .select(`
        *,
        events!inner(title, event_number),
        parties!event_operations_driver_id_fkey(display_name),
        vehicles!event_operations_vehicle_id_fkey(license_plate, model, brand)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar operação: ${error.message}`);
    }

    return data as OperationWithRelations;
  } catch (error) {
    throw new Error(`Erro ao criar operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function updateOperation(id: string, formData: FormData): Promise<OperationWithRelations> {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const updateData = {
      operation_type: formData.get("operation_type") as "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION",
      scheduled_start: formData.get("scheduled_start") as string,
      scheduled_end: formData.get("scheduled_end") as string || null,
      status: formData.get("status") as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
      driver_id: formData.get("driver_id") as string || null,
      vehicle_id: formData.get("vehicle_id") as string || null,
      notes: formData.get("notes") as string || null,
    };

    const { data, error } = await supabase
      .from("event_operations")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select(`
        *,
        events!inner(title, event_number),
        parties!event_operations_driver_id_fkey(display_name),
        vehicles!event_operations_vehicle_id_fkey(license_plate, model, brand)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar operação: ${error.message}`);
    }

    return data as OperationWithRelations;
  } catch (error) {
    throw new Error(`Erro ao atualizar operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function deleteOperation(id: string) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const { error } = await supabase
      .from("event_operations")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Erro ao deletar operação: ${error.message}`);
    }

    return true;
  } catch (error) {
    throw new Error(`Erro ao deletar operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getEventsForOperations() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_number, start_datetime, end_datetime")
      .eq("tenant_id", tenantId)
      .order("start_datetime", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar eventos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Erro ao buscar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getDrivers() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const { data, error } = await supabase
      .from("parties")
      .select("id, display_name, full_name")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("display_name");

    if (error) {
      throw new Error(`Erro ao buscar motoristas: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Erro ao buscar motoristas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getVehicles() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, license_plate, model, brand, vehicle_type")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("license_plate");

    if (error) {
      throw new Error(`Erro ao buscar veículos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Erro ao buscar veículos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getWorkers() {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  try {
    const { data, error } = await supabase
      .from("parties")
      .select("id, display_name, full_name")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("display_name");

    if (error) {
      throw new Error(`Erro ao buscar funcionários: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Erro ao buscar funcionários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
