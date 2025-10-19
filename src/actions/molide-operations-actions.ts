"use server";

import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import type { Database } from "@/lib/supabase/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventOperationInsert = Database["public"]["Tables"]["event_operations"]["Insert"];
type EventOperationRow = Database["public"]["Tables"]["event_operations"]["Row"];
type OperationType = Database["public"]["Enums"]["event_operation_type_enum"];
type OperationStatus = Database["public"]["Enums"]["operation_status_enum"];

const DEFAULT_OPERATION_STATUS: OperationStatus = "SCHEDULED";

const MOBILIZATION_OFFSET_HOURS = 4;
const CLEANING_OFFSET_HOURS = 1;
const DEMOBILIZATION_OFFSET_HOURS = 4;

interface GeneratedOperation {
  operation_type: OperationType;
  scheduled_start: string;
  scheduled_end: string | null;
  status: OperationStatus;
}

interface GenerateOperationsResult {
  inserted: EventOperationRow[];
}

export class EventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Evento ${eventId} n\u00e3o encontrado ou pertence a outro tenant.`);
    this.name = "EventNotFoundError";
  }
}

export async function generateStandardOperationsForEvent(eventId: string): Promise<GenerateOperationsResult> {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, tenant_id, start_datetime, end_datetime, event_type")
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (eventError) {
    throw new Error(`Falha ao buscar evento: ${eventError.message}`);
  }

  if (!event) {
    throw new EventNotFoundError(eventId);
  }

  const operations = buildOperationsFromEvent(event);

  if (operations.length === 0) {
    return { inserted: [] };
  }

  const operationTypes = operations.map((op) => op.operation_type);

  const { error: deleteError } = await supabase
    .from("event_operations")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("event_id", eventId)
    .in("operation_type", operationTypes);

  if (deleteError) {
    throw new Error(`Falha ao limpar opera\u00e7\u00f5es anteriores: ${deleteError.message}`);
  }

  const payload: EventOperationInsert[] = operations.map((op) => ({
    tenant_id: tenantId,
    event_id: eventId,
    operation_type: op.operation_type,
    scheduled_start: op.scheduled_start,
    scheduled_end: op.scheduled_end,
    status: op.status,
  }));

  const { data: insertedOperations, error: insertError } = await supabase
    .from("event_operations")
    .insert(payload)
    .select("*");

  if (insertError) {
    throw new Error(`Falha ao inserir opera\u00e7\u00f5es: ${insertError.message}`);
  }

  return { inserted: insertedOperations ?? [] };
}

function buildOperationsFromEvent(event: Pick<EventRow, "start_datetime" | "end_datetime" | "event_type">): GeneratedOperation[] {
  const operations: GeneratedOperation[] = [];

  if (!event.start_datetime) {
    return operations;
  }

  const start = new Date(event.start_datetime);
  if (Number.isNaN(start.getTime())) {
    return operations;
  }

  const mobilizationStart = subtractHours(start, MOBILIZATION_OFFSET_HOURS);

  operations.push({
    operation_type: "MOBILIZATION",
    scheduled_start: mobilizationStart.toISOString(),
    scheduled_end: start.toISOString(),
    status: DEFAULT_OPERATION_STATUS,
  });

  const hasEndDate = Boolean(event.end_datetime);
  const end = hasEndDate ? new Date(event.end_datetime as string) : start;

  if (!hasEndDate || Number.isNaN(end.getTime())) {
    const cleaningStart = addHours(start, CLEANING_OFFSET_HOURS);
    operations.push({
      operation_type: "CLEANING",
      scheduled_start: cleaningStart.toISOString(),
      scheduled_end: null,
      status: DEFAULT_OPERATION_STATUS,
    });

    const demobilizationStart = addHours(start, DEMOBILIZATION_OFFSET_HOURS);
    operations.push({
      operation_type: "DEMOBILIZATION",
      scheduled_start: demobilizationStart.toISOString(),
      scheduled_end: null,
      status: DEFAULT_OPERATION_STATUS,
    });

    return operations;
  }

  const cleaningStart = addHours(end, CLEANING_OFFSET_HOURS);
  operations.push({
    operation_type: "CLEANING",
    scheduled_start: cleaningStart.toISOString(),
    scheduled_end: null,
    status: DEFAULT_OPERATION_STATUS,
  });

  const demobilizationStart = addHours(end, DEMOBILIZATION_OFFSET_HOURS);
  operations.push({
    operation_type: "DEMOBILIZATION",
    scheduled_start: demobilizationStart.toISOString(),
    scheduled_end: null,
    status: DEFAULT_OPERATION_STATUS,
  });

  return operations;
}

function addHours(date: Date, hours: number): Date {
  const copy = new Date(date);
  copy.setHours(copy.getHours() + hours);
  return copy;
}

function subtractHours(date: Date, hours: number): Date {
  return addHours(date, -hours);
}
