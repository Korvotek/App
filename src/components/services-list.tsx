"use client";

import { useEffect, useState, useTransition } from "react";
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
import { RefreshCw } from "lucide-react";
import {
  listContaAzulServices,
  syncContaAzulServices,
} from "@/actions/conta-azul-services";

interface Service {
  id: string;
  tenant_id: string;
  external_id: string;
  legacy_id: number | null;
  external_code: string | null;
  code: string | null;
  description: string | null;
  service_type: string | null;
  status: string | null;
  price: number | null;
  cost: number | null;
  cnae_code: string | null;
  municipality_code: string | null;
  lei_116: string | null;
  synced_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSyncing, startSync] = useTransition();

  const limit = 10;

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setLoading(true);
      try {
        const data = await listContaAzulServices({
          page: currentPage,
          limit,
          search: searchTerm.trim(),
        });

        if (!isMounted) return;
        setServices(data.services as Service[]);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (error) {
        if (isMounted) {
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const refreshTable = async (page: number, search: string) => {
    const data = await listContaAzulServices({
      page,
      limit,
      search: search.trim(),
    });
    setServices(data.services as Service[]);
    setTotalCount(data.totalCount);
    setTotalPages(data.totalPages);
    setCurrentPage(data.currentPage);
  };

  const handleSyncServices = () => {
    startSync(async () => {
      try {
        await syncContaAzulServices();
        await refreshTable(currentPage, searchTerm);
      } catch (error) {
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Serviços</h1>
            <p className="text-muted-foreground text-sm">
              Consulte e mantenha os serviços sincronizados com o Conta Azul
            </p>
          </div>
          <PermissionGate resource="services" action="sync">
            <Button onClick={handleSyncServices} variant="outline">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
          </PermissionGate>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Carregando serviços...
          </div>
        </div>

        <TableShimmer rows={6} columns={7} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground text-sm">
            Consulte e mantenha os serviços sincronizados com o Conta Azul
          </p>
        </div>
        <PermissionGate resource="services" action="sync">
          <Button onClick={handleSyncServices} variant="outline">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} serviços total
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Nenhum serviço encontrado.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Última sincronização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  {service.description || "Sem descrição"}
                </TableCell>
                <TableCell>{service.code || service.external_code || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {service.service_type ?? "Não informado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      service.status?.toUpperCase() === "ATIVO"
                        ? "default"
                        : "secondary"
                    }
                    className="rounded-full"
                  >
                    {service.status ?? "Indefinido"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {service.price !== null && service.price !== undefined
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(service.price)
                    : "—"}
                </TableCell>
                <TableCell>
                  {service.cost !== null && service.cost !== undefined
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(service.cost)
                    : "—"}
                </TableCell>
                <TableCell>
                  {service.synced_at
                    ? new Date(service.synced_at).toLocaleString("pt-BR")
                    : "Nunca"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 || isSyncing ? "pointer-events-none opacity-50" : ""
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
                        handlePageChange(pageNumber);
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
                    handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages || isSyncing
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

