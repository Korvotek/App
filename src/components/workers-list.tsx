"use client";

import { useState, useEffect } from "react";
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
import { getWorkers } from "@/actions/worker-actions";
import Link from "next/link";
import { Plus, Edit, Eye, Users } from "lucide-react";

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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await getWorkers(currentPage, limit);
        if (data) {
          setWorkers(data.workers);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [currentPage]);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.party_employees[0]?.employee_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Carregando funcionários...
          </p>
        </div>
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
        <Link href="/dashboard/funcionarios/cadastrar">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar funcionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} funcionários total
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredWorkers.map((worker) => {
            const employee = worker.party_employees[0];
            const primaryContact = getPrimaryContact(worker.party_contacts);
            const roles = getWorkerRoles(employee);

            return (
              <Card
                key={worker.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {worker.display_name}
                      </CardTitle>
                      <CardDescription>{worker.full_name}</CardDescription>
                    </div>
                    <Badge variant={worker.active ? "default" : "secondary"}>
                      {worker.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Funcionário:</span>{" "}
                      {employee.employee_number}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">CPF:</span>{" "}
                      {worker.cpf || "Não informado"}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Contato:</span>{" "}
                      {primaryContact?.contact_value || "Não informado"}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Admissão:</span>{" "}
                      {employee.hire_date
                        ? new Date(employee.hire_date).toLocaleDateString(
                            "pt-BR",
                          )
                        : "Não informada"}
                    </div>
                    {roles.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Funções:</span>
                        <div className="flex gap-1 mt-1">
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
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
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
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
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
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )
    </div>
  );
}
