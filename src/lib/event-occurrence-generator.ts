import { type Event, type Weekday, WEEKDAY_TO_NUMBER } from "@/lib/validations/event-schema";

export interface EventOccurrence {
  id: string;
  eventId: string;
  operationType: "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION";
  scheduledStart: string;
  scheduledEnd: string;
  status: "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string;
  occurrenceDate: string;
  occurrenceTime: string;
  isAutomatic: boolean;
}

/**
 * Gera ocorrências automáticas baseadas no tipo de evento
 */
export function generateEventOccurrences(event: Event & { id: string }): EventOccurrence[] {
  const occurrences: EventOccurrence[] = [];

  switch (event.eventType) {
    case "UNICO":
      occurrences.push(...generateUniqueEventOccurrences(event));
      break;
    case "INTERMITENTE":
      occurrences.push(...generateIntermittentEventOccurrences(event));
      break;
    case "CONTINUO":
      occurrences.push(...generateContinuousEventOccurrences(event));
      break;
    default:
      throw new Error(`Tipo de evento não suportado: ${event.eventType}`);
  }

  return occurrences.sort((a, b) => 
    new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  );
}

/**
 * Gera ocorrências para eventos ÚNICOS
 * - Mobilização no início
 * - Limpeza pós-uso no final
 * - Desmobilização no final
 */
function generateUniqueEventOccurrences(event: Event & { id: string }): EventOccurrence[] {
  const occurrences: EventOccurrence[] = [];
  
  if (!("cleaningTime" in event.schedule)) {
    throw new Error("Evento único deve ter cleaningTime");
  }

  const mobilizationDate = new Date(`${event.schedule.mobilizationDate}T${event.schedule.mobilizationTime}`);
  const demobilizationDate = new Date(`${event.schedule.demobilizationDate}T${event.schedule.demobilizationTime}`);
  const cleaningDate = new Date(`${event.schedule.demobilizationDate}T${event.schedule.cleaningTime}`);

  // Mobilização
  occurrences.push({
    id: `mob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "MOBILIZATION",
    scheduledStart: mobilizationDate.toISOString(),
    scheduledEnd: mobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Mobilização de equipamentos para evento único",
    occurrenceDate: mobilizationDate.toISOString().split('T')[0],
    occurrenceTime: mobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  // Limpeza pós-uso
  occurrences.push({
    id: `clean-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "CLEANING",
    scheduledStart: cleaningDate.toISOString(),
    scheduledEnd: cleaningDate.toISOString(),
    status: "SCHEDULED",
    notes: "Limpeza pós-uso - evento único",
    occurrenceDate: cleaningDate.toISOString().split('T')[0],
    occurrenceTime: cleaningDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  // Desmobilização
  occurrences.push({
    id: `demob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "DEMOBILIZATION",
    scheduledStart: demobilizationDate.toISOString(),
    scheduledEnd: demobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Desmobilização de equipamentos - evento único",
    occurrenceDate: demobilizationDate.toISOString().split('T')[0],
    occurrenceTime: demobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  return occurrences;
}

/**
 * Gera ocorrências para eventos INTERMITENTES
 * - Mobilização no início
 * - Limpezas nos dias da semana selecionados durante o período
 * - Desmobilização no final
 */
function generateIntermittentEventOccurrences(event: Event & { id: string }): EventOccurrence[] {
  const occurrences: EventOccurrence[] = [];
  
  if (!("cleaningDays" in event.schedule) || !("cleaningTime" in event.schedule)) {
    throw new Error("Evento intermitente deve ter cleaningDays e cleaningTime");
  }

  const mobilizationDate = new Date(`${event.schedule.mobilizationDate}T${event.schedule.mobilizationTime}`);
  const demobilizationDate = new Date(`${event.schedule.demobilizationDate}T${event.schedule.demobilizationTime}`);
  
  const selectedDays = event.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const cleaningTime = event.schedule.cleaningTime;

  // Mobilização
  occurrences.push({
    id: `mob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "MOBILIZATION",
    scheduledStart: mobilizationDate.toISOString(),
    scheduledEnd: mobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Mobilização de equipamentos para evento intermitente",
    occurrenceDate: mobilizationDate.toISOString().split('T')[0],
    occurrenceTime: mobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  // Limpezas nos dias selecionados
  const currentDate = new Date(mobilizationDate);
  const endDate = new Date(demobilizationDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    if (selectedDays.includes(dayOfWeek)) {
      const cleaningDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${cleaningTime}`);
      
      occurrences.push({
        id: `clean-${event.id}-${currentDate.getTime()}`,
        eventId: event.id,
        operationType: "CLEANING",
        scheduledStart: cleaningDateTime.toISOString(),
        scheduledEnd: cleaningDateTime.toISOString(),
        status: "SCHEDULED",
        notes: `Limpeza programada - ${getWeekdayName(dayOfWeek)}`,
        occurrenceDate: currentDate.toISOString().split('T')[0],
        occurrenceTime: cleaningTime,
        isAutomatic: true,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Desmobilização
  occurrences.push({
    id: `demob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "DEMOBILIZATION",
    scheduledStart: demobilizationDate.toISOString(),
    scheduledEnd: demobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Desmobilização de equipamentos - evento intermitente",
    occurrenceDate: demobilizationDate.toISOString().split('T')[0],
    occurrenceTime: demobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  return occurrences;
}

/**
 * Gera ocorrências para eventos CONTÍNUOS
 * - Mobilização no início
 * - Limpezas regulares nos dias da semana selecionados até o fim
 * - Desmobilização no final
 */
function generateContinuousEventOccurrences(event: Event & { id: string }): EventOccurrence[] {
  const occurrences: EventOccurrence[] = [];
  
  if (!("cleaningDays" in event.schedule) || !("cleaningTime" in event.schedule)) {
    throw new Error("Evento contínuo deve ter cleaningDays e cleaningTime");
  }

  const mobilizationDate = new Date(`${event.schedule.mobilizationDate}T${event.schedule.mobilizationTime}`);
  const demobilizationDate = new Date(`${event.schedule.demobilizationDate}T${event.schedule.demobilizationTime}`);
  
  const selectedDays = event.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const cleaningTime = event.schedule.cleaningTime;

  // Mobilização
  occurrences.push({
    id: `mob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "MOBILIZATION",
    scheduledStart: mobilizationDate.toISOString(),
    scheduledEnd: mobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Mobilização inicial - evento contínuo",
    occurrenceDate: mobilizationDate.toISOString().split('T')[0],
    occurrenceTime: mobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  // Limpezas regulares nos dias selecionados
  const currentDate = new Date(mobilizationDate);
  const endDate = new Date(demobilizationDate);
  
  // Começar a partir do dia seguinte à mobilização
  currentDate.setDate(currentDate.getDate() + 1);
  
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    
    if (selectedDays.includes(dayOfWeek)) {
      const cleaningDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${cleaningTime}`);
      
      occurrences.push({
        id: `clean-${event.id}-${currentDate.getTime()}`,
        eventId: event.id,
        operationType: "CLEANING",
        scheduledStart: cleaningDateTime.toISOString(),
        scheduledEnd: cleaningDateTime.toISOString(),
        status: "SCHEDULED",
        notes: `Limpeza regular - ${getWeekdayName(dayOfWeek)}`,
        occurrenceDate: currentDate.toISOString().split('T')[0],
        occurrenceTime: cleaningTime,
        isAutomatic: true,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Desmobilização
  occurrences.push({
    id: `demob-${event.id}-${Date.now()}`,
    eventId: event.id,
    operationType: "DEMOBILIZATION",
    scheduledStart: demobilizationDate.toISOString(),
    scheduledEnd: demobilizationDate.toISOString(),
    status: "SCHEDULED",
    notes: "Desmobilização final - evento contínuo",
    occurrenceDate: demobilizationDate.toISOString().split('T')[0],
    occurrenceTime: demobilizationDate.toTimeString().substring(0, 5),
    isAutomatic: true,
  });

  return occurrences;
}

/**
 * Converte número do dia da semana para nome
 */
function getWeekdayName(dayNumber: number): string {
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return weekdays[dayNumber];
}

/**
 * Valida se um evento tem a configuração necessária para gerar ocorrências
 */
export function validateEventForOccurrenceGeneration(event: Event & { id: string }): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event.schedule.mobilizationDate || !event.schedule.mobilizationTime) {
    errors.push("Data e horário de mobilização são obrigatórios");
  }

  if (!event.schedule.demobilizationDate || !event.schedule.demobilizationTime) {
    errors.push("Data e horário de desmobilização são obrigatórios");
  }

  const mobilizationDate = new Date(`${event.schedule.mobilizationDate}T${event.schedule.mobilizationTime}`);
  const demobilizationDate = new Date(`${event.schedule.demobilizationDate}T${event.schedule.demobilizationTime}`);

  if (demobilizationDate <= mobilizationDate) {
    errors.push("Data de desmobilização deve ser posterior à data de mobilização");
  }

  if (event.eventType === "INTERMITENTE" || event.eventType === "CONTINUO") {
    if (!("cleaningDays" in event.schedule) || !event.schedule.cleaningDays || event.schedule.cleaningDays.length === 0) {
      errors.push("Pelo menos um dia da semana deve ser selecionado para limpeza");
    }
    if (!("cleaningTime" in event.schedule) || !event.schedule.cleaningTime) {
      errors.push("Horário de limpeza é obrigatório");
    }
  }

  if (event.eventType === "UNICO") {
    if (!("cleaningTime" in event.schedule) || !event.schedule.cleaningTime) {
      errors.push("Horário de limpeza pós-uso é obrigatório");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gera um resumo das ocorrências criadas
 */
export function generateOccurrenceSummary(occurrences: EventOccurrence[]): {
  totalOccurrences: number;
  mobilizationCount: number;
  cleaningCount: number;
  demobilizationCount: number;
  dateRange: { start: string; end: string };
  cleaningDays: string[];
} {
  const mobilizationCount = occurrences.filter(o => o.operationType === "MOBILIZATION").length;
  const cleaningCount = occurrences.filter(o => o.operationType === "CLEANING").length;
  const demobilizationCount = occurrences.filter(o => o.operationType === "DEMOBILIZATION").length;

  const dates = occurrences.map(o => o.occurrenceDate).sort();
  const cleaningDays = [...new Set(occurrences.filter(o => o.operationType === "CLEANING").map(o => o.occurrenceDate))].sort();

  return {
    totalOccurrences: occurrences.length,
    mobilizationCount,
    cleaningCount,
    demobilizationCount,
    dateRange: {
      start: dates[0] || "",
      end: dates[dates.length - 1] || ""
    },
    cleaningDays
  };
}
