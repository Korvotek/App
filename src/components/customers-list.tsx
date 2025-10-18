"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { TableShimmer } from "@/components/ui/shimmer";
import { SearchInput } from "@/components/ui/search-input";
import { PermissionGate } from "@/components/auth/permission-gate";
import { RefreshCw } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDocument } from "@/lib/utils";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  document: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  person_type: string | null;
  active: boolean | null;
  external_id: string;
  synced_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function CustomersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: customersData, isLoading, error } = useCustomers({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm,
  });

  const total = customersData?.total || 0;
  
  const pagination = usePagination({
    initialPage: currentPage,
    initialLimit: 10,
    totalItems: total,
  });

  const customers = customersData?.customers || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSyncCustomers = async () => {
    try {
      const response = await fetch("/api/customers/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Erro ao sincronizar clientes");
      }

      window.location.reload();
    } catch (error) {
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os clientes do sistema e sincronize com integrações externas
            </p>
          </div>
          <PermissionGate resource="customers" action="sync">
            <Button onClick={handleSyncCustomers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </PermissionGate>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Carregando...
          </div>
        </div>

        <TableShimmer rows={8} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar clientes</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os clientes do sistema e sincronize com integrações externas
          </p>
        </div>
        <PermissionGate resource="customers" action="sync">
          <Button onClick={handleSyncCustomers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {total} clientes total
        </div>
      </div>

      
      {customers.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sincronizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer: Customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name || "Sem nome"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {customer.person_type === "F" ? "Pessoa Física" : 
                     customer.person_type === "J" ? "Pessoa Jurídica" : 
                     customer.person_type || "Não informado"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDocument(customer.document) || "Sem documento"}</TableCell>
                <TableCell>{customer.email || "Sem email"}</TableCell>
                <TableCell>
                  {customer.city && customer.state 
                    ? `${customer.city}/${customer.state}`
                    : customer.city || customer.state || "Não informado"
                  }
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={customer.active ? "default" : "secondary"}
                    className="rounded-full"
                  >
                    {customer.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {customer.synced_at 
                    ? new Date(customer.synced_at).toLocaleDateString('pt-BR')
                    : "Nunca"
                  }
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
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
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
                  className={
                    currentPage >= pagination.totalPages
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
