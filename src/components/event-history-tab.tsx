"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Calendar, User, Edit } from "lucide-react";

interface EventHistoryTabProps {
  eventId: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  field_name: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

export function EventHistoryTab({ eventId }: EventHistoryTabProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [eventId]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulação de dados - aqui seria feita a chamada real para a API
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          user_id: "user1",
          user_name: "João Silva",
          action: "UPDATE",
          field_name: "title",
          old_value: "Evento Original",
          new_value: "Evento Atualizado",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          user_id: "user2",
          user_name: "Maria Santos",
          action: "UPDATE",
          field_name: "contract_value",
          old_value: "1000.00",
          new_value: "1200.00",
          created_at: "2024-01-14T14:20:00Z",
        },
        {
          id: "3",
          user_id: "user1",
          user_name: "João Silva",
          action: "CREATE",
          field_name: "event",
          old_value: "",
          new_value: "Evento Original",
          created_at: "2024-01-10T09:00:00Z",
        },
      ];

      setAuditLogs(mockLogs);
    } catch (err) {
      setError("Erro ao carregar histórico");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-100 text-green-800";
      case "UPDATE": return "bg-blue-100 text-blue-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE": return "Criado";
      case "UPDATE": return "Atualizado";
      case "DELETE": return "Excluído";
      default: return action;
    }
  };

  const getFieldLabel = (fieldName: string) => {
    const fieldLabels: { [key: string]: string } = {
      title: "Título",
      description: "Descrição",
      event_type: "Tipo de Evento",
      start_date: "Data de Início",
      end_date: "Data de Fim",
      contract_value: "Valor do Contrato",
      client_name: "Nome do Cliente",
      client_email: "E-mail do Cliente",
      client_phone: "Telefone do Cliente",
      address_street: "Rua",
      address_number: "Número",
      address_city: "Cidade",
      address_state: "Estado",
      address_postal_code: "CEP",
      cleaning_start_time: "Horário de Início da Limpeza",
      cleaning_end_time: "Horário de Fim da Limpeza",
      cleaning_days: "Dias de Limpeza",
    };
    
    return fieldLabels[fieldName] || fieldName;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            Carregando histórico...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Histórico de Alterações</span>
          </CardTitle>
          <CardDescription>
            Log de todas as alterações realizadas neste evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma alteração registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Anterior</TableHead>
                    <TableHead>Novo Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDateTime(log.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{log.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getFieldLabel(log.field_name)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.old_value || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.new_value || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}