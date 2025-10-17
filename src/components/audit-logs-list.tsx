"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getActivityLogs, getUsersForFilter } from "@/actions/audit-actions";
import { toast } from "sonner";
import { 
  Activity,
  CheckCircle,
  User,
  Filter,
  AlertTriangle,
  Eye,
  Calendar
} from "lucide-react";

import type { Database } from "@/lib/supabase/database.types";

type Json = Database["public"]["Tables"]["activity_logs"]["Row"]["metadata"];

type ActivityLog = {
  id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  success: boolean | null;
  error_message: string | null;
  metadata: Json;
  timestamp: string | null;
  user_id: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
};

type User = {
  id: string;
  email: string;
  full_name: string | null;
};

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
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    actionType: "all",
    dateFrom: "",
    dateTo: "",
    userId: "all",
  });
  const limit = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [logsData, usersData] = await Promise.all([
          getActivityLogs(
            currentPage,
            limit,
            filters.actionType !== "all" ? filters.actionType : undefined,
            filters.dateFrom || undefined,
            filters.dateTo || undefined,
            filters.userId !== "all" ? filters.userId : undefined
          ),
          getUsersForFilter(),
        ]);

        if (logsData) {
          setLogs(logsData.logs);
          setTotalPages(logsData.totalPages);
          setTotalCount(logsData.totalCount);
        }

        if (usersData) {
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Erro ao buscar logs de auditoria:", error);
        toast.error("Erro ao carregar logs de auditoria");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando logs de auditoria...</p>
        </div>
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


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Atividade</CardTitle>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground">
              {totalCount} registros encontrados
            </div>
          </CardContent>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground">
                  Não há registros de atividade para os filtros selecionados
                </p>
              </div>
            </div>
          ) : (
            <>
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

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}