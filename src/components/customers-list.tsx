"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Eye, RefreshCw, Search } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  document: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  active: boolean | null;
  external_id: string;
  created_at: string;
  updated_at: string;
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchCustomers = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }

      const data: CustomersResponse = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchCustomers(1, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCustomers(page, searchTerm);
  };

  const handleSyncCustomers = async () => {
    try {
      const response = await fetch("/api/customers/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Erro ao sincronizar clientes");
      }

      fetchCustomers(currentPage, searchTerm);
    } catch (error) {
      console.error("Erro ao sincronizar clientes:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie os clientes do sistema e sincronize com integrações externas.
          </p>
        </div>
        
        <PermissionGate resource="customers" action="sync">
          <Button onClick={handleSyncCustomers} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
        </PermissionGate>
      </div>

      {/* Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou documento..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
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
              <TableHead>Email</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name || "Sem nome"}
                </TableCell>
                <TableCell>{customer.email || "Sem email"}</TableCell>
                <TableCell>{customer.document || "Sem documento"}</TableCell>
                <TableCell>{customer.city || "Sem cidade"}</TableCell>
                <TableCell>
                  <Badge variant={customer.active ? "default" : "secondary"}>
                    {customer.active ? "Ativo" : "Inativo"}
                  </Badge>
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
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({total} clientes)
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
