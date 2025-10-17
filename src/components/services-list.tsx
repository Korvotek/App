"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Eye, RefreshCw, Search } from "lucide-react";

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

interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchServices = async (page = 1, search = "") => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });

      const response = await fetch(`/api/services?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar serviços");
      }

      const data: ServicesResponse = await response.json();
      setServices(data.services);
      setCurrentPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchServices(1, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchServices(page, searchTerm);
  };

  const handleSyncServices = async () => {
    try {
      const response = await fetch("/api/services/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao sincronizar serviços");
      }

      await fetchServices(currentPage, searchTerm);
    } catch (error) {
      console.error("Erro ao sincronizar serviços:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return <div className="py-8 text-center">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">
            Consulte e mantenha os serviços sincronizados com o Conta Azul.
          </p>
        </div>

        <PermissionGate resource="services" action="sync">
          <Button onClick={handleSyncServices} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
        </PermissionGate>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição, código ou ID externo..."
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {services.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Nenhum serviço encontrado.
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
              <TableHead>Ações</TableHead>
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
                  <Badge variant="outline">
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
                <TableCell>
                  <PermissionGate resource="services" action="read">
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
              Página {currentPage} de {totalPages} ({total} serviços)
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

