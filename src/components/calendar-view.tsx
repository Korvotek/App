"use client";

import { useState, useMemo } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useOperations } from "@/hooks/use-operations";
import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  List, 
  Filter,
  Eye,
  EyeOff
} from "lucide-react";
import type { OperationWithRelations } from "@/actions/operations-actions";
import type { Tables } from "@/lib/supabase/database.types";

// Configurar moment para português brasileiro
moment.locale("pt-br");
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "operation" | "event";
  resource: OperationWithRelations | Tables<"events">;
  color?: string;
}

const operationTypeColors = {
  MOBILIZATION: "#3B82F6", // Azul
  CLEANING: "#10B981", // Verde
  DEMOBILIZATION: "#F59E0B", // Amarelo
};

const eventTypeColors = {
  UNICO: "#8B5CF6", // Roxo
  INTERMITENTE: "#EC4899", // Rosa
};

const operationTypeLabels = {
  MOBILIZATION: "Mobilização",
  CLEANING: "Limpeza",
  DEMOBILIZATION: "Desmobilização",
};

const eventTypeLabels = {
  UNICO: "Único",
  INTERMITENTE: "Intermittente",
};

export function CalendarView() {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [showOperations, setShowOperations] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>("all");

  // Buscar operações
  const { data: operationsData, isLoading: operationsLoading } = useOperations({
    page: 1,
    limit: 1000, // Buscar muitas operações para o calendário
  });

  // Buscar eventos
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    page: 1,
    limit: 1000, // Buscar muitos eventos para o calendário
  });

  const operations = operationsData?.operations || [];
  const events = eventsData?.events || [];

  // Converter operações e eventos para eventos do calendário
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Adicionar operações
    if (showOperations) {
      operations.forEach((operation) => {
        if (operationTypeFilter !== "all" && operation.operation_type !== operationTypeFilter) {
          return;
        }

        const startDate = new Date(operation.scheduled_start);
        const endDate = operation.scheduled_end 
          ? new Date(operation.scheduled_end)
          : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 horas depois se não houver fim

        calendarEvents.push({
          id: `operation-${operation.id}`,
          title: `${operationTypeLabels[operation.operation_type as keyof typeof operationTypeLabels] || operation.operation_type} - ${operation.events?.title || "Sem evento"}`,
          start: startDate,
          end: endDate,
          type: "operation",
          resource: operation,
          color: operationTypeColors[operation.operation_type as keyof typeof operationTypeColors],
        });
      });
    }

    // Adicionar eventos
    if (showEvents) {
      events.forEach((eventItem) => {
        const startDate = new Date(eventItem.start_datetime);
        const endDate = eventItem.end_datetime 
          ? new Date(eventItem.end_datetime)
          : new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8 horas depois se não houver fim

        calendarEvents.push({
          id: `event-${eventItem.id}`,
          title: `${eventItem.title} (${eventItem.event_number})`,
          start: startDate,
          end: endDate,
          type: "event",
          resource: eventItem as unknown as Tables<"events">,
          color: eventTypeColors[eventItem.event_type as keyof typeof eventTypeColors],
        });
      });
    }

    return calendarEvents;
  }, [operations, showOperations, showEvents, operationTypeFilter]);

  // Componente para renderizar eventos no calendário
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const isOperation = event.type === "operation";
    const resource = event.resource as OperationWithRelations | Tables<"events">;
    
    return (
      <div className="text-xs p-1">
        <div className="font-medium truncate">{event.title}</div>
        {isOperation ? (
          <div className="text-gray-600">
            {(resource as OperationWithRelations).events?.client_name || "Sem cliente"}
          </div>
        ) : (
          <div className="text-gray-600">
            {(resource as Tables<"events">).client_name || "Sem cliente"}
          </div>
        )}
      </div>
    );
  };

  // Estilos para eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color || "#6B7280",
        color: "white",
        borderRadius: "4px",
        border: "none",
        fontSize: "12px",
      },
    };
  };

  const isLoading = operationsLoading || eventsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Operações e Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando calendário...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Operações e Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controles */}
        <div className="mb-6 space-y-4">
          {/* Filtros de visualização */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={showOperations ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOperations(!showOperations)}
                className="flex items-center gap-2"
              >
                {showOperations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Operações
              </Button>
              <Button
                variant={showEvents ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEvents(!showEvents)}
                className="flex items-center gap-2"
              >
                {showEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Eventos
              </Button>
            </div>

            {/* Filtro de tipo de operação */}
            {showOperations && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo de operação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(operationTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Seletor de visualização */}
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <Select value={view} onValueChange={(value) => setView(value as View)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Legenda:</span>
            {showOperations && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">Operações:</span>
                {Object.entries(operationTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: color }}
                    />
                    <span>{operationTypeLabels[type as keyof typeof operationTypeLabels]}</span>
                  </div>
                ))}
              </div>
            )}
            {showEvents && (
              <div className="flex items-center gap-2">
                <span className="text-purple-600">Eventos:</span>
                {Object.entries(eventTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: color }}
                    />
                    <span>{eventTypeLabels[type as keyof typeof eventTypeLabels]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendário */}
        <div className="h-96">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{
              event: EventComponent,
            }}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Nenhum evento neste período",
              showMore: (total) => `+${total} mais`,
            }}
            style={{ height: "100%" }}
          />
        </div>

        {/* Estatísticas */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {operations.length}
            </div>
            <div className="text-sm text-blue-600">Operações</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {events.length}
            </div>
            <div className="text-sm text-purple-600">Eventos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {calendarEvents.length}
            </div>
            <div className="text-sm text-green-600">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
