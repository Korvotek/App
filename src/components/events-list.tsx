"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { TableShimmer } from "@/components/ui/shimmer";
import { SearchInput } from "@/components/ui/search-input";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Plus, Calendar } from "lucide-react";
import { getEvents, type EventsResponse } from "@/actions/event-actions";
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from "@/lib/validations/event-schema";
import { usePagination } from "@/hooks/use-pagination";
import { formatDocument } from "@/lib/utils";

type Event = EventsResponse['events'][0];

export function EventsList() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalItems, setTotalItems] = useState(0);

  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 12,
    totalItems: totalItems,
  });

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = {
        search: searchTerm || undefined,
        eventType: eventTypeFilter !== "all" ? eventTypeFilter as "UNICO" | "INTERMITENTE" : undefined,
        status: statusFilter !== "all" ? statusFilter as "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" : undefined,
      };

      const response: EventsResponse = await getEvents(
        pagination.currentPage,
        pagination.limit,
        filters
      );

      setEvents(response.events);
      setTotalItems(response.totalCount);
    } catch (err) {
      setError("Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, eventTypeFilter, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_number.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os eventos de locação
            </p>
          </div>
          <PermissionGate resource="events" action="create">
            <Link href="/dashboard/eventos/cadastrar">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </Link>
          </PermissionGate>
        </div>

        
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="UNICO">Único</SelectItem>
              <SelectItem value="INTERMITENTE">Intermitente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            Carregando eventos...
          </div>
        </div>

        <TableShimmer rows={6} columns={9} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os eventos de locação
          </p>
        </div>
        <PermissionGate resource="events" action="create">
          <Link href="/dashboard/eventos/cadastrar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </Link>
        </PermissionGate>
      </div>

      
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="UNICO">Único</SelectItem>
            <SelectItem value="INTERMITENTE">Intermitente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
            <SelectItem value="COMPLETED">Concluído</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {pagination.totalItems} eventos total
        </div>
      </div>

      
      {filteredEvents.length === 0 ? (
        <div className="rounded-lg border-2 border-border bg-white p-8 text-center shadow-lg">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || eventTypeFilter !== "all" || statusFilter !== "all"
                ? "Nenhum evento encontrado"
                : "Nenhum evento cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || eventTypeFilter !== "all" || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece cadastrando o primeiro evento"}
            </p>
            {!searchTerm && eventTypeFilter === "all" && statusFilter === "all" && (
              <PermissionGate resource="events" action="create">
                <Link href="/dashboard/eventos/cadastrar">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Evento
                  </Button>
                </Link>
              </PermissionGate>
            )}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow 
                key={event.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/dashboard/eventos/${event.id}`)}
              >
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.event_number}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {event.event_type ? EVENT_TYPE_LABELS[event.event_type] : "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={event.status === "DRAFT" ? "secondary" : "default"}
                    className="rounded-full"
                  >
                    {event.status ? EVENT_STATUS_LABELS[event.status] : "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.conta_azul_customers?.name ? (
                    <div>
                      <div className="font-medium">
                        {event.conta_azul_customers.name}
                      </div>
                      {event.conta_azul_customers.document && (
                        <div className="text-sm text-muted-foreground">
                          {formatDocument(event.conta_azul_customers.document)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Cliente não informado</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(event.start_datetime)}</TableCell>
                <TableCell>{event.end_datetime ? formatDate(event.end_datetime) : "N/A"}</TableCell>
                <TableCell>{event.created_at ? formatDate(event.created_at) : "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.goToPreviousPage();
                  }}
                  className={
                    !pagination.hasPreviousPage ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = pagination.currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.goToPage(pageNumber);
                      }}
                      isActive={pagination.currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.goToNextPage();
                  }}
                  className={
                    !pagination.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
