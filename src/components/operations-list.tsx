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
import { PermissionGate } from "@/components/auth/permission-gate";
import { 
  Calendar, 
  Clock, 
  User, 
  Truck, 
  Plus
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
  } = pagination;

  const { data: operationsData, isLoading, error } = useOperations({
    page: currentPage,
    limit,
    search: debouncedSearchTerm.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
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
          <PermissionGate resource="events" action="create">
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
          <PermissionGate resource="events" action="create">
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

      
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar operações..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          {Object.entries(operationStatusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="text-sm text-muted-foreground">
          {totalFromServer} operação{totalFromServer !== 1 ? 'ões' : ''}
        </div>
      </div>

      
      {isLoading ? (
        <TableShimmer rows={5} columns={6} />
      ) : operations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma operação encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando uma nova operação."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-border bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow 
                  key={operation.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/operacoes/${operation.id}`)}
                >
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
                  <TableCell>
                    <Badge variant="outline">
                      {operationTypeLabels[operation.operation_type as keyof typeof operationTypeLabels] || operation.operation_type}
                    </Badge>
                  </TableCell>
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
                  <TableCell>
                    {operation.parties?.display_name ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {operation.parties.display_name}
                      </div>
                    ) : operation.driver_id ? (
                      <span className="text-gray-400">Motorista {operation.driver_id.substring(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {operation.vehicles ? (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <div>
                          <div className="font-medium">
                            {operation.vehicles.license_plate}
                          </div>
                          <div className="text-sm text-gray-500">
                            {operation.vehicles.brand} {operation.vehicles.model}
                          </div>
                        </div>
                      </div>
                    ) : operation.vehicle_id ? (
                      <span className="text-gray-400">Veículo {operation.vehicle_id.substring(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={statusColors[operation.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                    >
                      {operation.status ? operationStatusLabels[operation.status as keyof typeof operationStatusLabels] || operation.status : "N/A"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      
      {totalFromServer > 0 && (
        <div className="flex justify-center mt-6">
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


