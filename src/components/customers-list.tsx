"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Eye, RefreshCw } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { usePagination } from "@/hooks/use-pagination";

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
  
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 10,
  });

  const { data: customersData, isLoading, error } = useCustomers({
    page: pagination.currentPage,
    limit: pagination.limit,
    search: searchTerm,
  });

  // Atualizar total de itens quando os dados chegarem
  const total = customersData?.total || 0;
  pagination.totalItems = total;

  const customers = customersData?.customers || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    pagination.resetPage();
  };

  const handleSyncCustomers = async () => {
    try {
      const response = await fetch("/api/customers/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Erro ao sincronizar clientes");
      }

      // Refetch dos dados após sincronização
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sincronizar clientes:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando clientes...</div>;
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
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {total} clientes total
        </div>
      </div>

      {/* Tabela de Clientes */}
      {customers.length === 0 ? (
        <div className="text-center py-8">
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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer: Customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name || "Sem nome"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {customer.person_type === "F" ? "Pessoa Física" : 
                     customer.person_type === "J" ? "Pessoa Jurídica" : 
                     customer.person_type || "Não informado"}
                  </Badge>
                </TableCell>
                <TableCell>{customer.document || "Sem documento"}</TableCell>
                <TableCell>{customer.email || "Sem email"}</TableCell>
                <TableCell>
                  {customer.city && customer.state 
                    ? `${customer.city}/${customer.state}`
                    : customer.city || customer.state || "Não informado"
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={customer.active ? "default" : "secondary"}>
                    {customer.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {customer.synced_at 
                    ? new Date(customer.synced_at).toLocaleDateString('pt-BR')
                    : "Nunca"
                  }
                </TableCell>
                <TableCell>
                  <PermissionGate resource="customers" action="read">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.goToPreviousPage()}
              disabled={!pagination.hasPreviousPage}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Página {pagination.currentPage} de {pagination.totalPages} ({total} clientes)
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.goToNextPage()}
              disabled={!pagination.hasNextPage}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
