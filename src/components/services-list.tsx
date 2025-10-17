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
import { PermissionGate } from "@/components/auth/permission-gate";
import { Eye, RefreshCw } from "lucide-react";
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
          console.error("Erro ao carregar serviços:", error);
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
        console.error("Erro ao sincronizar serviços:", error);
      }
    });
  };

  if (loading) {
    return <div className="py-8 text-center">Carregando serviços...</div>;
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
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} serviços total
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
              disabled={currentPage === 1 || isSyncing}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({totalCount} serviços)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isSyncing}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

