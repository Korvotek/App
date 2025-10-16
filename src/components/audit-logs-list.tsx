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
import { getActivityLogs, getActivityStats } from "@/actions/audit-actions";
import { toast } from "sonner";
import { 
  Activity,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle
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

type ActivityStats = {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  successRate: number;
  actionTypes: Record<string, number>;
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
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    actionType: "all",
    dateFrom: "",
    dateTo: "",
  });
  const limit = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          getActivityLogs(currentPage, limit, filters.actionType, filters.dateFrom, filters.dateTo),
          getActivityStats()
        ]);
        
        if (logsData) {
          setLogs(logsData.logs);
          setTotalPages(logsData.totalPages);
          setTotalCount(logsData.totalCount);
        }
        
        if (statsData) {
          setStats(statsData);
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
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "LOGIN":
      case "LOGOUT":
        return <User className="h-4 w-4" />;
      case "CREATE_EVENT":
      case "CREATE_CLIENT":
      case "CREATE_EMPLOYEE":
      case "CREATE_USER":
        return <CheckCircle className="h-4 w-4" />;
      case "DELETE_EVENT":
      case "DELETE_CLIENT":
      case "DELETE_EMPLOYEE":
      case "DELETE_USER":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string, success: boolean | null) => {
    if (success === false) return "destructive";
    
    switch (actionType) {
      case "LOGIN":
        return "default";
      case "LOGOUT":
        return "secondary";
      case "CREATE_EVENT":
      case "CREATE_CLIENT":
      case "CREATE_EMPLOYEE":
      case "CREATE_USER":
        return "default";
      case "DELETE_EVENT":
      case "DELETE_CLIENT":
      case "DELETE_EMPLOYEE":
      case "DELETE_USER":
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulActions}</div>
              <p className="text-xs text-muted-foreground">Ações bem-sucedidas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedActions}</div>
              <p className="text-xs text-muted-foreground">Ações com erro</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Eficiência do sistema</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium">&nbsp;</label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Logs de Atividade</h2>
          <div className="text-sm text-muted-foreground">
            {totalCount} registros encontrados
          </div>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground">
                  Não há registros de atividade para os filtros selecionados
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <Badge variant={getActionColor(log.action_type, log.success)}>
                          {actionTypeLabels[log.action_type] || log.action_type}
                        </Badge>
                        {log.success === false && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {log.users?.full_name || log.users?.email || "Usuário desconhecido"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                        
                        {log.entity_type && (
                          <div className="text-sm text-muted-foreground">
                            Entidade: {log.entity_type}
                            {log.entity_id && ` (ID: ${log.entity_id})`}
                          </div>
                        )}
                        
                        {log.error_message && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Erro:</strong> {log.error_message}
                          </div>
                        )}
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <details className="cursor-pointer">
                              <summary className="font-medium">Detalhes</summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
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
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
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
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
