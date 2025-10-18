"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { EventSchema, UpdateEventSchema, type EventFilters } from "@/lib/validations/event-schema";

export interface EventsResponse {
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    client_id: string | null;
    event_number: string;
    event_type: "UNICO" | "INTERMITENTE" | null;
    start_datetime: string;
    end_datetime: string | null;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
    conta_azul_customers: {
      name: string | null;
      document: string | null;
    } | null;
  }>;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContaAzulService {
  id: string;
  code?: string | null;
  description?: string | null;
  cost?: number | null;
  external_code?: string | null;
}

export interface ContaAzulCustomer {
  id: string;
  name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
}

export async function createEvent(formData: FormData) {
  try {
    const { tenantId, supabase } = await getCurrentUserAndTenant();

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      customerId: formData.get("customerId") as string,
      customerName: formData.get("customerName") as string,
      customerDocument: formData.get("customerDocument") as string,
      contractNumber: formData.get("contractNumber") as string,
      eventType: formData.get("eventType") as "UNICO" | "INTERMITENTE",
      address: {
        street: formData.get("address.street") as string,
        number: formData.get("address.number") as string,
        complement: formData.get("address.complement") as string,
        neighborhood: formData.get("address.neighborhood") as string,
        city: formData.get("address.city") as string,
        state: formData.get("address.state") as string,
        zipCode: formData.get("address.zipCode") as string,
      },
      services: JSON.parse(formData.get("services") as string || "[]"),
      schedule: JSON.parse(formData.get("schedule") as string || "{}"),
      evidence: formData.get("evidence") as string || null,
    };

    const validatedData = EventSchema.parse(eventData);

    let clientId = validatedData.customerId;

    const { data: existingClient } = await supabase
      .from("conta_azul_customers")
      .select("id")
      .eq("external_id", validatedData.customerId)
      .eq("tenant_id", tenantId)
      .single();

    if (!existingClient) {
      const { data: newClient, error: clientError } = await supabase
        .from("conta_azul_customers")
        .insert({
          external_id: validatedData.customerId,
          tenant_id: tenantId,
          name: validatedData.customerName,
          document: validatedData.customerDocument,
          email: null,
          phone: null,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (clientError) {
        throw new Error(`Erro ao criar cliente: ${clientError.message}`);
      }

      clientId = newClient.id;
    } else {
      clientId = existingClient.id;
    }

    const eventRecord = {
      tenant_id: tenantId,
      event_number: `${validatedData.contractNumber}-${Date.now()}`,
      event_year: new Date().getFullYear(),
      title: validatedData.title,
      description: validatedData.description,
      client_id: clientId,
      event_type: validatedData.eventType,
      start_datetime: `${validatedData.schedule?.mobilizationDate}T${validatedData.schedule?.mobilizationTime}`,
      end_datetime: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.demobilizationTime}`,
      status: "DRAFT" as const,
      created_at: new Date().toISOString(),
    };

    const { data: insertedEvent, error } = await supabase
      .from("events")
      .insert(eventRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao inserir evento: ${error.message}`);
    }

    const eventLocationRecord = {
      tenant_id: tenantId,
      event_id: insertedEvent.id,
      location_role: "VENUE" as const,
      street: validatedData.address.street,
      number: validatedData.address.number,
      complement: validatedData.address.complement || null,
      neighborhood: validatedData.address.neighborhood,
      city: validatedData.address.city,
      state: validatedData.address.state,
      postal_code: validatedData.address.zipCode,
      reference_point: null,
      is_primary: true,
      created_at: new Date().toISOString(),
    };

    const { error: locationError } = await supabase
      .from("event_locations")
      .insert(eventLocationRecord);

    if (locationError) {
      throw new Error(`Erro ao inserir localização do evento: ${locationError.message}`);
    }

    const operations = [
      {
        operation_type: "MOBILIZATION",
        scheduled_start: `${validatedData.schedule?.mobilizationDate}T${validatedData.schedule?.mobilizationTime}`,
        scheduled_end: `${validatedData.schedule?.mobilizationDate}T${validatedData.schedule?.mobilizationTime}`,
        status: "SCHEDULED",
        notes: "Mobilização de equipamentos para o evento",
      },
      {
        operation_type: "CLEANING",
        scheduled_start: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.cleaningTime}`,
        scheduled_end: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.cleaningTime}`,
        status: "SCHEDULED",
        notes: "Limpeza pós evento",
      },
      {
        operation_type: "DEMOBILIZATION",
        scheduled_start: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.demobilizationTime}`,
        scheduled_end: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.demobilizationTime}`,
        status: "SCHEDULED",
        notes: "Desmobilização de equipamentos",
      },
    ];

    for (const operation of operations) {
        const operationRecord = {
          tenant_id: tenantId,
          event_id: insertedEvent.id,
          operation_type: operation.operation_type as "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION",
          scheduled_start: operation.scheduled_start,
          scheduled_end: operation.scheduled_end,
          status: operation.status as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
          notes: operation.notes,
        };

      const { error: operationError } = await supabase
        .from("event_operations")
        .insert(operationRecord);

      if (operationError) {
        console.error("Erro ao criar operação:", operationError);
        throw new Error(`Erro ao criar operação ${operation.operation_type}: ${operationError.message}`);
      }
    }

    if (validatedData.services && validatedData.services.length > 0) {
      console.log("🔧 Processando serviços do evento:", validatedData.services.length);
      
      for (const service of validatedData.services) {
        try {
          // Buscar o serviço na tabela conta_azul_services (onde estão os serviços do Conta Azul)
          const { data: contaAzulService, error: findError } = await supabase
            .from("conta_azul_services")
            .select("id, external_id, description, cost")
            .eq("id", service.serviceId)
            .eq("tenant_id", tenantId)
            .single();

          if (findError || !contaAzulService) {
            console.error("❌ Serviço do Conta Azul não encontrado:", service.serviceId);
            throw new Error(`Serviço do Conta Azul não encontrado: ${service.serviceId}`);
          }

          console.log("✅ Serviço do Conta Azul encontrado:", contaAzulService.description);

          // Verificar se já existe um produto/serviço correspondente na tabela products_services
          const { data: productService, error: productFindError } = await supabase
            .from("products_services")
            .select("id")
            .eq("external_id", contaAzulService.external_id)
            .eq("tenant_id", tenantId)
            .single();

          let serviceId: string;

          if (productFindError || !productService) {
            console.log("📝 Criando produto/serviço baseado no Conta Azul:", contaAzulService.description);
            
            // Criar um produto/serviço baseado no serviço do Conta Azul
            const { data: newService, error: createError } = await supabase
              .from("products_services")
              .insert({
                tenant_id: tenantId,
                external_id: contaAzulService.external_id,
                description: contaAzulService.description || service.serviceName,
                item_type: "SERVICE",
                service_type: "PROVIDED",
                sale_price: service.dailyValue,
                cost_price: contaAzulService.cost || service.dailyValue * 0.7,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (createError) {
              console.error("❌ Erro ao criar produto/serviço:", createError);
              throw new Error(`Erro ao criar produto/serviço: ${createError.message}`);
            }

            serviceId = newService.id;
            console.log("✅ Produto/serviço criado com ID:", serviceId);
          } else {
            serviceId = productService.id;
            console.log("✅ Produto/serviço encontrado com ID:", serviceId);
          }

          // Criar o registro de serviço do evento
          const eventServiceRecord = {
            event_id: insertedEvent.id,
            product_service_id: serviceId,
            quantity: service.quantity,
            unit_price: service.dailyValue,
            total_price: service.totalValue,
            notes: service.observations || null,
            tenant_id: tenantId,
          };

          const { error: serviceError } = await supabase
            .from("event_services")
            .insert(eventServiceRecord);

          if (serviceError) {
            console.error("❌ Erro ao criar serviço do evento:", serviceError);
            throw new Error(`Erro ao criar serviço do evento: ${serviceError.message}`);
          }

          console.log("✅ Serviço do evento criado com sucesso");
        } catch (serviceErr) {
          console.error("❌ Erro ao processar serviço:", serviceErr);
          // Continuar com os outros serviços mesmo se um falhar
          continue;
        }
      }
    }

    revalidatePath("/dashboard/eventos");
  } catch (error) {
    throw new Error(`Erro ao criar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  // Redirect após sucesso (fora do try-catch para evitar capturar NEXT_REDIRECT)
  redirect("/dashboard/eventos/success");
}

export async function getEvents(
  page: number = 1,
  limit: number = 12,
  filters: EventFilters = {}
): Promise<EventsResponse> {
  try {
    console.log("🔍 getEvents - Iniciando busca:", { page, limit, filters });
    
    const { tenantId, supabase } = await getCurrentUserAndTenant();
    console.log("✅ getEvents - Tenant ID:", tenantId.substring(0, 8) + "...");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("events")
      .select(`
        *,
        conta_azul_customers!events_client_id_fkey(
          name,
          document,
          email,
          phone
        ),
        event_locations(
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code
        ),
        event_services(
          *,
          products_services(
            description,
            item_type,
            service_type
          )
        )
      `, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,event_number.ilike.%${filters.search}%`);
    }

    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data: events, error, count } = await query.range(from, to);

    console.log("📊 getEvents - Resultado da query:", {
      eventsCount: events?.length || 0,
      totalCount: count,
      error: error?.message,
      hasEvents: !!events
    });

    if (error) {
      console.error("❌ getEvents - Erro na query:", error);
      throw new Error("Erro ao buscar eventos");
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const result = {
      events: events || [],
      totalCount,
      page,
      limit,
      totalPages,
    };

    console.log("✅ getEvents - Retornando resultado:", {
      eventsCount: result.events.length,
      totalCount: result.totalCount,
      totalPages: result.totalPages
    });

    return result;
  } catch (error) {
    throw new Error("Erro ao buscar eventos");
  }
}

export async function getEventById(id: string) {
  try {
    const { tenantId, supabase } = await getCurrentUserAndTenant();

    const { data: event, error } = await supabase
      .from("events")
      .select(`
        *,
        event_locations!event_locations_event_id_fkey(
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code,
          location_role,
          is_primary
        )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      throw new Error("Evento não encontrado");
    }

    return event;
  } catch (error) {
    throw new Error("Erro ao buscar evento");
  }
}

export async function updateEvent(id: string, formData: FormData) {
  try {
    const { tenantId, supabase } = await getCurrentUserAndTenant();

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      customerId: formData.get("customerId") as string,
      contractNumber: formData.get("contractNumber") as string,
      eventType: formData.get("eventType") as "UNICO" | "INTERMITENTE",
      address: {
        street: formData.get("address.street") as string,
        number: formData.get("address.number") as string,
        complement: formData.get("address.complement") as string,
        neighborhood: formData.get("address.neighborhood") as string,
        city: formData.get("address.city") as string,
        state: formData.get("address.state") as string,
        zipCode: formData.get("address.zipCode") as string,
      },
      services: JSON.parse(formData.get("services") as string || "[]"),
      schedule: JSON.parse(formData.get("schedule") as string || "{}"),
    };

    const validatedData = UpdateEventSchema.parse(eventData);

    const updateData = {
      title: validatedData.title,
      description: validatedData.description,
      client_id: validatedData.customerId,
      event_number: validatedData.contractNumber,
      event_type: validatedData.eventType,
      start_datetime: `${validatedData.schedule?.mobilizationDate}T${validatedData.schedule?.mobilizationTime}`,
      end_datetime: `${validatedData.schedule?.demobilizationDate}T${validatedData.schedule?.demobilizationTime}`,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error("Erro ao atualizar evento");
    }

    if (validatedData.address) {
      const locationUpdateData = {
        street: validatedData.address.street,
        number: validatedData.address.number,
        complement: validatedData.address.complement || null,
        neighborhood: validatedData.address.neighborhood,
        city: validatedData.address.city,
        state: validatedData.address.state,
        postal_code: validatedData.address.zipCode,
        reference_point: null,
        updated_at: new Date().toISOString(),
      };

      const { error: locationError } = await supabase
        .from("event_locations")
        .update(locationUpdateData)
        .eq("event_id", id)
        .eq("tenant_id", tenantId)
        .eq("is_primary", true);

      if (locationError) {
        throw new Error(`Erro ao atualizar localização do evento: ${locationError.message}`);
      }
    }

    revalidatePath("/dashboard/eventos");
  } catch (error) {
    throw new Error("Erro ao atualizar evento");
  }
}

export async function deleteEvent(id: string) {
  try {
    const { tenantId, supabase } = await getCurrentUserAndTenant();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error("Erro ao deletar evento");
    }

    revalidatePath("/dashboard/eventos");
  } catch (error) {
    throw new Error("Erro ao deletar evento");
  }
}

export async function getContaAzulServices(): Promise<ContaAzulService[]> {
  try {
    const { supabase } = await getCurrentUserAndTenant();

    const { data: services, error } = await supabase
      .from("conta_azul_services")
      .select("*")
      .order("description");

    if (error) {
      return [];
    }

    return services.map((service) => ({
      id: service.id,
      code: service.code,
      description: service.description,
      cost: service.cost,
      external_code: service.external_code,
    }));
  } catch (error) {
    return [];
  }
}

export async function getContaAzulCustomers(): Promise<ContaAzulCustomer[]> {
  try {
    const { supabase } = await getCurrentUserAndTenant();

    const { data: customers, error } = await supabase
      .from("conta_azul_customers")
      .select("*")
      .order("name");

    if (error) {
      return [];
    }

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
    }));
  } catch (error) {
    return [];
  }
}
