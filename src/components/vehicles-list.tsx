"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { TableShimmer } from "@/components/ui/shimmer";
import { SearchInput } from "@/components/ui/search-input";
import { PermissionGate } from "@/components/auth/permission-gate";
import Link from "next/link";
import { Plus, Edit, Eye, Car } from "lucide-react";
import { useVehicles } from "@/hooks/use-vehicles";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";

export function VehiclesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: vehiclesData, isLoading, error } = useVehicles({
    page: currentPage,
    limit: 12,
    search: debouncedSearchTerm.trim() || undefined,
  });

  const total = vehiclesData?.totalCount || 0;
  
  const pagination = usePagination({
    initialPage: currentPage,
    initialLimit: 12,
    totalItems: total,
  });

  const vehicles = vehiclesData?.vehicles || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVehicleTypeLabel = (type: string | null) => {
    switch (type) {
      case "CARGA":
        return "Carga";
      case "TANQUE":
        return "Tanque";
      default:
        return "Não informado";
    }
  };

  const getVehicleTypeColor = (type: string | null) => {
    switch (type) {
      case "CARGA":
        return "bg-blue-100 text-blue-800";
      case "TANQUE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Veículos</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie a frota de veículos da empresa
            </p>
          </div>
          <PermissionGate resource="vehicles" action="create">
            <Link href="/dashboard/veiculos/cadastrar">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Veículo
              </Button>
            </Link>
          </PermissionGate>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar veículos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Carregando...
          </div>
        </div>

        <TableShimmer rows={6} columns={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar veículos</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Veículos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie a frota de veículos da empresa
          </p>
        </div>
        <PermissionGate resource="vehicles" action="create">
          <Link href="/dashboard/veiculos/cadastrar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar veículos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {total} veículos total
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "Nenhum veículo encontrado"
                : "Nenhum veículo cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos de busca"
                : "Comece cadastrando o primeiro veículo"}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/veiculos/cadastrar">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Veículo
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">
                  {vehicle.brand} {vehicle.model}
                </TableCell>
                <TableCell>{vehicle.license_plate}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getVehicleTypeColor(vehicle.vehicle_type)}`}
                  >
                    {getVehicleTypeLabel(vehicle.vehicle_type)}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.fuel_type || "Não informado"}</TableCell>
                <TableCell>
                  {vehicle.module_capacity 
                    ? `${vehicle.module_capacity.toLocaleString("pt-BR")} L`
                    : "Não informado"
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={vehicle.active ? "default" : "secondary"}>
                    {vehicle.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <PermissionGate resource="vehicles" action="read">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="vehicles" action="update">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </PermissionGate>
                  </div>
                </TableCell>
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
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pagination.totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
