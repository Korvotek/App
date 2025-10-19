import { z } from "zod";

export const EventTypeEnum = z.enum(["UNICO", "INTERMITENTE", "CONTINUO"]);

export const WeekdayEnum = z.enum([
  "MONDAY",
  "TUESDAY", 
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
]);

export const EventServiceSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  serviceName: z.string().min(1, "Nome do serviço é obrigatório"),
  dailyValue: z.number().min(0, "Valor diária deve ser positivo"),
  days: z.number().int().min(1, "Diárias deve ser pelo menos 1"),
  quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
  observations: z.string().optional(),
  totalValue: z.number().min(0, "Valor total deve ser positivo"),
});

export const EventAddressSchema = z.object({
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "UF é obrigatória").max(2, "UF deve ter 2 caracteres"),
  zipCode: z.string().min(8, "CEP é obrigatório").max(9, "CEP inválido"),
});

export const EventFormSchema = z.object({
  title: z.string().min(1, "Título do evento é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  contract_number: z.string().min(1, "Número do contrato é obrigatório"),
  event_type: EventTypeEnum,
  mobilization_date: z.string().min(1, "Data de mobilização é obrigatória"),
  mobilization_time: z.string().min(1, "Horário de mobilização é obrigatório"),
  demobilization_date: z.string().min(1, "Data de desmobilização é obrigatória"),
  demobilization_time: z.string().min(1, "Horário de desmobilização é obrigatório"),
  cleaning_time: z.string().min(1, "Horário de limpeza pós uso é obrigatório"),
  cleaning_days: z.array(WeekdayEnum).optional(),
  address_street: z.string().min(1, "Logradouro é obrigatório"),
  address_number: z.string().min(1, "Número é obrigatório"),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().min(1, "Bairro é obrigatório"),
  address_city: z.string().min(1, "Cidade é obrigatória"),
  address_state: z.string().min(2, "UF é obrigatória").max(2, "UF deve ter 2 caracteres"),
  address_postal_code: z.string().min(8, "CEP é obrigatório").max(9, "CEP inválido"),
}).refine((data) => {
  if (data.event_type === "INTERMITENTE" || data.event_type === "CONTINUO") {
    return data.cleaning_days && data.cleaning_days.length > 0;
  }
  return true;
}, {
  message: "Pelo menos um dia da semana deve ser selecionado para eventos intermitentes e contínuos",
  path: ["cleaning_days"]
}).refine((data) => {
  const mobilizationDate = new Date(`${data.mobilization_date}T${data.mobilization_time}`);
  const demobilizationDate = new Date(`${data.demobilization_date}T${data.demobilization_time}`);
  
  return demobilizationDate > mobilizationDate;
}, {
  message: "Data de desmobilização deve ser posterior à data de mobilização",
  path: ["demobilization_date"]
}).refine((data) => {
  const mobilizationDate = new Date(`${data.mobilization_date}T${data.mobilization_time}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  return mobilizationDate >= today;
}, {
  message: "Data de mobilização deve ser maior ou igual a hoje",
  path: ["mobilization_date"]
});

export const UniqueEventScheduleSchema = z.object({
  mobilizationDate: z.string().min(1, "Data de mobilização é obrigatória"),
  mobilizationTime: z.string().min(1, "Horário de mobilização é obrigatório"),
  demobilizationDate: z.string().min(1, "Data de desmobilização é obrigatória"),
  demobilizationTime: z.string().min(1, "Horário de desmobilização é obrigatório"),
  cleaningTime: z.string().min(1, "Horário de limpeza pós uso é obrigatório"),
});

export const IntermittentEventScheduleSchema = z.object({
  mobilizationDate: z.string().min(1, "Data de mobilização é obrigatória"),
  mobilizationTime: z.string().min(1, "Horário de mobilização é obrigatório"),
  demobilizationDate: z.string().min(1, "Data de desmobilização é obrigatória"),
  demobilizationTime: z.string().min(1, "Horário de desmobilização é obrigatório"),
  cleaningDays: z.array(WeekdayEnum).min(1, "Pelo menos um dia da semana deve ser selecionado"),
  cleaningTime: z.string().min(1, "Horário de limpeza é obrigatório"),
});

export const ContinuousEventScheduleSchema = z.object({
  mobilizationDate: z.string().min(1, "Data de mobilização é obrigatória"),
  mobilizationTime: z.string().min(1, "Horário de mobilização é obrigatório"),
  demobilizationDate: z.string().min(1, "Data de desmobilização é obrigatória"),
  demobilizationTime: z.string().min(1, "Horário de desmobilização é obrigatório"),
  cleaningDays: z.array(WeekdayEnum).min(1, "Pelo menos um dia da semana deve ser selecionado"),
  cleaningTime: z.string().min(1, "Horário de limpeza é obrigatório"),
});

export const EventSchema = z.object({
  title: z.string().min(1, "Título do evento é obrigatório"),
  description: z.string().optional(),
  customerId: z.string().min(1, "Cliente é obrigatório"),
  customerName: z.string().min(1, "Nome do cliente é obrigatório"),
  customerDocument: z.string().min(1, "CNPJ do cliente é obrigatório"),
  contractNumber: z.string().min(1, "Número do contrato é obrigatório"),
  eventType: EventTypeEnum,
  address: EventAddressSchema,
  services: z.array(EventServiceSchema).min(1, "Pelo menos um serviço deve ser adicionado"),
  schedule: z.union([UniqueEventScheduleSchema, IntermittentEventScheduleSchema, ContinuousEventScheduleSchema]),
  evidence: z.string().optional().nullable(),
}).refine((data) => {
  if (data.eventType === "UNICO") {
    return "mobilizationDate" in data.schedule && 
           "mobilizationTime" in data.schedule &&
           "demobilizationDate" in data.schedule && 
           "demobilizationTime" in data.schedule && 
           "cleaningTime" in data.schedule;
  }
  
  if (data.eventType === "INTERMITENTE" || data.eventType === "CONTINUO") {
    return "mobilizationDate" in data.schedule && 
           "mobilizationTime" in data.schedule &&
           "demobilizationDate" in data.schedule && 
           "demobilizationTime" in data.schedule && 
           "cleaningDays" in data.schedule && 
           "cleaningTime" in data.schedule;
  }
  
  return false;
}, {
  message: "Configuração de programação inválida para o tipo de evento selecionado",
  path: ["schedule"]
}).refine((data) => {
  const mobilizationDate = new Date(`${data.schedule.mobilizationDate}T${data.schedule.mobilizationTime}`);
  const demobilizationDate = new Date(`${data.schedule.demobilizationDate}T${data.schedule.demobilizationTime}`);
  
  return demobilizationDate > mobilizationDate;
}, {
  message: "Data de desmobilização deve ser posterior à data de mobilização",
  path: ["schedule", "demobilizationDate"]
}).refine((data) => {
  const mobilizationDate = new Date(`${data.schedule.mobilizationDate}T${data.schedule.mobilizationTime}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  return mobilizationDate >= today;
}, {
  message: "Data de mobilização deve ser maior ou igual a hoje",
  path: ["schedule", "mobilizationDate"]
});

export const UpdateEventSchema = EventSchema.partial().extend({
  id: z.string().min(1, "ID do evento é obrigatório"),
});

export const EventFiltersSchema = z.object({
  search: z.string().optional(),
  eventType: EventTypeEnum.optional(),
  customerId: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type EventForm = z.infer<typeof EventFormSchema>;
export type EventType = z.infer<typeof EventTypeEnum>;
export type Weekday = z.infer<typeof WeekdayEnum>;
export type EventService = z.infer<typeof EventServiceSchema>;
export type EventAddress = z.infer<typeof EventAddressSchema>;
export type UniqueEventSchedule = z.infer<typeof UniqueEventScheduleSchema>;
export type IntermittentEventSchedule = z.infer<typeof IntermittentEventScheduleSchema>;
export type ContinuousEventSchedule = z.infer<typeof ContinuousEventScheduleSchema>;
export type Event = z.infer<typeof EventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira", 
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
};


export const WEEKDAY_TO_NUMBER: Record<Weekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  UNICO: "Único",
  INTERMITENTE: "Intermitente",
  CONTINUO: "Contínuo"
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado"
};
