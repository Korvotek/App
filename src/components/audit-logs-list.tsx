"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useActivityLogs, useUsersForFilter } from "@/hooks/use-audit";
import { usePagination } from "@/hooks/use-pagination";
import { 
  Activity,
  CheckCircle,
  User,
  Filter,
  AlertTriangle,
  Eye,
  Calendar
} from "lucide-react";

const actionTypeLabels: Record<string, string> = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  CREATE_EVENT: "Criar Evento",
  UPDATE_EVENT: "Atualizar Evento",
  DELETE_EVENT: "Deletar Evento",
  CREATE_CLIENT: "Criar Cliente",
  UPDATE_CLIENT: "Atualizar Cliente",
  DELETE_CLIENT: "Deletar Cliente",
  CREATE_EMPLOYEE: "Criar Funcionário",
  UPDATE_EMPLOYEE: "Atualizar Funcionário",
  DELETE_EMPLOYEE: "Deletar Funcionário",
  CREATE_USER: "Criar Usuário",
  UPDATE_USER: "Atualizar Usuário",
  DELETE_USER: "Deletar Usuário",
  CREATE_MOLIDE_OPERATION: "Criar Operação Molide",
  UPDATE_MOLIDE_OPERATION: "Atualizar Operação Molide",
  DELETE_MOLIDE_OPERATION: "Deletar Operação Molide",
  ASSIGN_DRIVER: "Atribuir Motorista",
  ASSIGN_VEHICLE: "Atribuir Veículo",
  EXPORT_DATA: "Exportar Dados",
  IMPORT_DATA: "Importar Dados",
};

export function AuditLogsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    actionType: "all",
    dateFrom: "",
    dateTo: "",
    userId: "all",
  });
  
  const { data: logsData, isLoading, error } = useActivityLogs({
    page: currentPage,
    limit: 20,
    actionType: filters.actionType !== "all" ? filters.actionType : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    userId: filters.userId !== "all" ? filters.userId : undefined,
  });

  const { data: usersData } = useUsersForFilter();

  const total = logsData?.totalCount || 0;
  
  const pagination = usePagination({
    initialPage: currentPage,
    initialLimit: 20,
    totalItems: total,
  });

  const logs = logsData?.logs || [];
  const users = usersData || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilters({
      actionType: "all",
      dateFrom: "",
      dateTo: "",
      userId: "all",
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "LOGIN":
      case "LOGOUT":
        return <User className="h-4 w-4 text-blue-600" />;
      case "CREATE_EMPLOYEE":
      case "UPDATE_EMPLOYEE":
      case "DELETE_EMPLOYEE":
        return <User className="h-4 w-4 text-green-600" />;
      case "CREATE_USER":
      case "UPDATE_USER":
      case "DELETE_USER":
        return <User className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (actionType: string, success: boolean | null) => {
    if (success === false) {
      return "destructive";
    }
    
    switch (actionType) {
      case "LOGIN":
      case "LOGOUT":
        return "default";
      case "CREATE_EMPLOYEE":
      case "CREATE_USER":
      case "CREATE_MOLIDE_OPERATION":
        return "default";
      case "UPDATE_EMPLOYEE":
      case "UPDATE_USER":
      case "UPDATE_MOLIDE_OPERATION":
        return "secondary";
      case "DELETE_EMPLOYEE":
      case "DELETE_USER":
      case "DELETE_MOLIDE_OPERATION":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
            <p className="text-muted-foreground text-sm">
              Acompanhe todas as atividades realizadas no sistema
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Ação</label>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <TableShimmer rows={8} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar logs de auditoria</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe todas as atividades realizadas no sistema
          </p>
        </div>
      </div>

      
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Ação</label>
            <Select
              value={filters.actionType}
              onValueChange={(value) => handleFilterChange("actionType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(actionTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Usuário</label>
            <Select
              value={filters.userId}
              onValueChange={(value) => handleFilterChange("userId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      
      {logs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
            <p className="text-muted-foreground">
              Não há registros de atividade para os filtros selecionados
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {total} registros encontrados
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action_type)}
                      <Badge variant={getActionColor(log.action_type, log.success)}>
                        {actionTypeLabels[log.action_type] || log.action_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {log.users?.full_name || "Nome não informado"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.users?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.success === false ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sucesso
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.entity_type ? (
                      <div>
                        <div className="font-medium">{log.entity_type}</div>
                        {log.entity_id && (
                          <div className="text-sm text-muted-foreground">
                            ID: {log.entity_id.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.error_message ? (
                      <div className="max-w-xs">
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded truncate">
                          {log.error_message}
                        </div>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
