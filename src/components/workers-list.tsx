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
import { Plus, Edit, Eye, Users } from "lucide-react";
import { useWorkers } from "@/hooks/use-workers";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDocument } from "@/lib/utils";

type Worker = {
  id: string;
  display_name: string;
  full_name: string | null;
  cpf: string | null;
  active: boolean | null;
  party_employees: Array<{
    employee_number: string;
    hire_date: string | null;
    is_driver: boolean | null;
    is_helper: boolean | null;
  }>;
  party_contacts: Array<{
    contact_type: string;
    contact_value: string;
    is_primary: boolean | null;
  }>;
};

export function WorkersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: workersData, isLoading, error } = useWorkers({
    page: currentPage,
    limit: 12,
    search: debouncedSearchTerm.trim() || undefined,
  });

  const total = workersData?.totalCount || 0;
  
  const pagination = usePagination({
    initialPage: currentPage,
    initialLimit: 12,
    totalItems: total,
  });

  const workers = workersData?.workers || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPrimaryContact = (contacts: Worker["party_contacts"]) => {
    const primaryContact = contacts.find((contact) => contact.is_primary);
    return primaryContact || contacts[0];
  };

  const getWorkerRoles = (employee: Worker["party_employees"][0]) => {
    const roles = [];
    if (employee.is_driver) roles.push("Motorista");
    if (employee.is_helper) roles.push("Ajudante");
    return roles;
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Funcionários</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os funcionários da empresa
            </p>
          </div>
          <PermissionGate resource="employees" action="create">
            <Link href="/dashboard/funcionarios/cadastrar">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </Link>
          </PermissionGate>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar funcionários..."
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
        <p className="text-red-500">Erro ao carregar funcionários</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os funcionários da empresa
          </p>
        </div>
        <PermissionGate resource="employees" action="create">
          <Link href="/dashboard/funcionarios/cadastrar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar funcionários..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {total} funcionários total
        </div>
      </div>

      
      {workers.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "Nenhum funcionário encontrado"
                : "Nenhum funcionário cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos de busca"
                : "Comece cadastrando o primeiro funcionário"}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/funcionarios/cadastrar">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Funcionário
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nome Completo</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Funções</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => {
              const employee = worker.party_employees[0];
              const primaryContact = getPrimaryContact(worker.party_contacts);
              const roles = getWorkerRoles(employee);

              return (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">
                    {worker.display_name}
                  </TableCell>
                  <TableCell>{worker.full_name || "Não informado"}</TableCell>
                  <TableCell>{formatDocument(worker.cpf) || "Não informado"}</TableCell>
                  <TableCell>{employee.employee_number}</TableCell>
                  <TableCell>{primaryContact?.contact_value || "Não informado"}</TableCell>
                  <TableCell>
                    {employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString("pt-BR")
                      : "Não informada"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="text-xs"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <PermissionGate resource="employees" action="read">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </PermissionGate>
                      <PermissionGate resource="employees" action="update">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
