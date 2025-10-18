"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOperations } from "@/hooks/use-operations";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/ui/search-input";
import { TableShimmer } from "@/components/ui/shimmer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionGate } from "@/components/auth/permission-gate";
import { 
  Calendar, 
  Clock, 
  User, 
  Truck, 
  Plus,
  Filter,
  X
} from "lucide-react";
import type { OperationWithRelations } from "@/actions/operations-actions";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const operationTypeLabels = {
  MOBILIZATION: "Mobilização",
  CLEANING: "Limpeza",
  DEMOBILIZATION: "Desmobilização",
};

const operationStatusLabels = {
  PENDING: "Pendente",
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export function OperationsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [operationTypeFilter, setOperationTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 12,
  });

  const {
    currentPage,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
    totalItems,
    setTotalItems,
    changeLimit,
  } = pagination;

  const { data: operationsData, isLoading, error } = useOperations({
    page: currentPage,
    limit,
    search: debouncedSearchTerm.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
    orderFulfillmentId: orderFulfillmentFilter.trim() || undefined,
    driverId: driverFilter.trim() || undefined,
    operationType: operationTypeFilter !== "all" ? operationTypeFilter : undefined,
  });

  const totalFromServer = operationsData?.totalCount ?? 0;

  useEffect(() => {
    if (totalFromServer !== totalItems) {
      setTotalItems(totalFromServer);
    }
  }, [totalFromServer, totalItems, setTotalItems]);

  const operations = (operationsData?.operations || []) as OperationWithRelations[];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    resetPage();
  };

  const handleStartDateFilter = (date: string) => {
    setStartDateFilter(date);
    resetPage();
  };

  const handleEndDateFilter = (date: string) => {
    setEndDateFilter(date);
    resetPage();
  };

  const handleOrderFulfillmentFilter = (value: string) => {
    setOrderFulfillmentFilter(value);
    resetPage();
  };

  const handleDriverFilter = (value: string) => {
    setDriverFilter(value);
    resetPage();
  };

  const handleOperationTypeFilter = (type: string) => {
    setOperationTypeFilter(type);
    resetPage();
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setOrderFulfillmentFilter("");
    setDriverFilter("");
    setOperationTypeFilter("all");
    resetPage();
  };

  const hasActiveFilters = () => {
    return (
      searchTerm.trim() !== "" ||
      statusFilter !== "all" ||
      startDateFilter !== "" ||
      endDateFilter !== "" ||
      orderFulfillmentFilter.trim() !== "" ||
      driverFilter.trim() !== "" ||
      operationTypeFilter !== "all"
    );
  };

  const handleLimitChange = (newLimit: number) => {
    changeLimit(newLimit);
  };


  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", dateTime, error);
      return "Data inválida";
    }
  };

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar hora:", dateTime, error);
      return "Hora inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Operações</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie as operações dos eventos
            </p>
          </div>
          <PermissionGate resource="operations" action="create">
            <Link href="/dashboard/operacoes/cadastrar">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Operação
              </Button>
            </Link>
          </PermissionGate>
        </div>
        <TableShimmer rows={5} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Operações</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie as operações dos eventos
            </p>
          </div>
          <PermissionGate resource="operations" action="create">
            <Link href="/dashboard/operacoes/cadastrar">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Operação
              </Button>
            </Link>
          </PermissionGate>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Erro ao carregar operações</p>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Operações</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as operações dos eventos
          </p>
        </div>
        <PermissionGate resource="operations" action="create">
          <Link href="/dashboard/operacoes/cadastrar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Operação
            </Button>
          </Link>
        </PermissionGate>
      </div>

      
      {/* Barra de busca e filtros principais */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar operações..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
              !
            </Badge>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          {totalFromServer} operação{totalFromServer !== 1 ? 'ões' : ''}
        </div>
      </div>

      {/* Painel de filtros expandido */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filtros Avançados</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Status */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                {Object.entries(operationStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Tipo de Operação */}
            <div className="space-y-2">
              <Label htmlFor="operation-type-filter">Tipo de Operação</Label>
              <select
                id="operation-type-filter"
                value={operationTypeFilter}
                onChange={(e) => handleOperationTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(operationTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Inicial */}
            <div className="space-y-2">
              <Label htmlFor="start-date-filter">Data Inicial</Label>
              <Input
                id="start-date-filter"
                type="date"
                value={startDateFilter}
                onChange={(e) => handleStartDateFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por Data Final */}
            <div className="space-y-2">
              <Label htmlFor="end-date-filter">Data Final</Label>
              <Input
                id="end-date-filter"
                type="date"
                value={endDateFilter}
                onChange={(e) => handleEndDateFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por Número O.F */}
            <div className="space-y-2">
              <Label htmlFor="order-fulfillment-filter">Número O.F</Label>
              <Input
                id="order-fulfillment-filter"
                placeholder="Digite o número O.F..."
                value={orderFulfillmentFilter}
                onChange={(e) => handleOrderFulfillmentFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por Motorista */}
            <div className="space-y-2">
              <Label htmlFor="driver-filter">Motorista</Label>
              <Input
                id="driver-filter"
                placeholder="Digite o nome do motorista..."
                value={driverFilter}
                onChange={(e) => handleDriverFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      
      {isLoading ? (
        <TableShimmer rows={5} columns={6} />
      ) : operations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma operação encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters()
              ? "Tente ajustar os filtros de busca."
              : "Comece criando uma nova operação."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-border bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Equipamentos/Serviços</TableHead>
                <TableHead>O.F</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Veículo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow 
                  key={operation.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/operacoes/${operation.id}`)}
                >
                  {/* Data/Hora */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(operation.scheduled_start)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTime(operation.scheduled_start)}
                        {operation.scheduled_end && (
                          <> - {formatTime(operation.scheduled_end)}</>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <Badge variant="outline">
                      {operationTypeLabels[operation.operation_type as keyof typeof operationTypeLabels] || operation.operation_type}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge 
                      className={statusColors[operation.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                    >
                      {operation.status ? operationStatusLabels[operation.status as keyof typeof operationStatusLabels] || operation.status : "N/A"}
                    </Badge>
                  </TableCell>

                  {/* Evento */}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {operation.events?.title || `Evento ${operation.event_id?.substring(0, 8)}...`}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{operation.events?.event_number || "N/A"}
                      </div>
                    </div>
                  </TableCell>

                  {/* Local */}
                  <TableCell>
                    <div className="text-sm">
                      {operation.events?.event_locations?.[0] ? (
                        <div>
                          <div className="font-medium">
                            {operation.events.event_locations[0].street}, {operation.events.event_locations[0].number}
                          </div>
                          <div className="text-gray-500">
                            {operation.events.event_locations[0].neighborhood}, {operation.events.event_locations[0].city}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Equipamentos/Serviços */}
                  <TableCell>
                    <div className="text-sm">
                      {operation.events?.event_services && operation.events.event_services.length > 0 ? (
                        <div className="space-y-1">
                          {operation.events.event_services.slice(0, 2).map((service, index) => (
                            <div key={service.id || index} className="text-xs">
                              <div className="font-medium">
                                {service.products_services?.description || "Serviço não especificado"}
                              </div>
                              {service.quantity && (
                                <div className="text-gray-500">
                                  Qtd: {service.quantity}
                                </div>
                              )}
                            </div>
                          ))}
                          {operation.events.event_services.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{operation.events.event_services.length - 2} mais
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </div>
                  </TableCell>

                  {/* O.F */}
                  <TableCell>
                    <div className="text-sm">
                      {operation.order_fulfillment_id ? (
                        <span className="font-medium">#{operation.order_fulfillment_id.substring(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Produtor */}
                  <TableCell>
                    <div className="text-sm">
                      {operation.events?.client_name ? (
                        <span>{operation.events.client_name}</span>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Motorista */}
                  <TableCell>
                    {operation.parties?.display_name ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{operation.parties.display_name}</span>
                      </div>
                    ) : operation.driver_id ? (
                      <span className="text-gray-400 text-sm">Motorista {operation.driver_id.substring(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Não atribuído</span>
                    )}
                  </TableCell>

                  {/* Veículo */}
                  <TableCell>
                    {operation.vehicles ? (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <div>
                          <div className="font-medium text-sm">
                            {operation.vehicles.license_plate}
                          </div>
                          <div className="text-xs text-gray-500">
                            {operation.vehicles.brand} {operation.vehicles.model}
                          </div>
                        </div>
                      </div>
                    ) : operation.vehicle_id ? (
                      <span className="text-gray-400 text-sm">Veículo {operation.vehicle_id.substring(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Não atribuído</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      
      {/* Controles de paginação */}
      {totalFromServer > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          {/* Seletor de quantidade por página */}
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page" className="text-sm text-gray-600">
              Itens por página:
            </Label>
            <select
              id="items-per-page"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Informações da paginação */}
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * limit) + 1} a {Math.min(currentPage * limit, totalFromServer)} de {totalFromServer} operações
          </div>
        </div>
      )}

      {/* Paginação */}
      {totalFromServer > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousPage();
                  }}
                  className={
                    !hasPreviousPage ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(pageNumber);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  className={
                    !hasNextPage
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


