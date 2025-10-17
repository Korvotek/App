"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { PermissionGate } from "@/components/auth/permission-gate";
import Link from "next/link";
import { Plus, Edit, Eye, Car } from "lucide-react";
import { useVehicles } from "@/hooks/use-vehicles";
import { usePagination } from "@/hooks/use-pagination";

export function VehiclesList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 12,
  });

  const { data: vehiclesData, isLoading, error } = useVehicles({
    page: pagination.currentPage,
    limit: pagination.limit,
  });

  // Atualizar total de itens quando os dados chegarem
  const totalCount = vehiclesData?.totalCount || 0;
  pagination.totalItems = totalCount;

  const vehicles = vehiclesData?.vehicles || [];

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando veículos...</p>
        </div>
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
          <input
            type="text"
            placeholder="Buscar veículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} veículos total
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>{vehicle.license_plate}</CardDescription>
                  </div>
                  <Badge variant={vehicle.active ? "default" : "secondary"}>
                    {vehicle.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Ano:</span> {vehicle.year}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tipo:</span>{" "}
                    <Badge
                      variant="outline"
                      className={`text-xs ${getVehicleTypeColor(
                        vehicle.vehicle_type,
                      )}`}
                    >
                      {getVehicleTypeLabel(vehicle.vehicle_type)}
                    </Badge>
                  </div>
                  {vehicle.fuel_type && (
                    <div className="text-sm">
                      <span className="font-medium">Combustível:</span>{" "}
                      {vehicle.fuel_type}
                    </div>
                  )}
                  {vehicle.module_capacity && (
                    <div className="text-sm">
                      <span className="font-medium">Capacidade:</span>{" "}
                      {vehicle.module_capacity.toLocaleString("pt-BR")} L
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Cadastrado em:</span>{" "}
                    {vehicle.created_at
                      ? new Date(vehicle.created_at).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <PermissionGate resource="vehicles" action="read">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </PermissionGate>
                  <PermissionGate resource="vehicles" action="update">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </PermissionGate>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  size="default"
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
                      size="icon"
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
                  size="default"
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
