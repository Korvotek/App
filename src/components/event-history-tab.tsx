"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Calendar, User } from "lucide-react";
import { useEventAuditLogs } from "@/hooks/use-event-details";

interface EventHistoryTabProps {
  eventId: string;
}

export function EventHistoryTab({ eventId }: EventHistoryTabProps) {
  const { data: auditLogs, isLoading, error } = useEventAuditLogs(eventId);

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
            Erro ao carregar histórico: {error.message}
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
          {!auditLogs || auditLogs.length === 0 ? (
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
                          <span>{formatDateTime(log.timestamp || log.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{log.user_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action_type)}>
                          {getActionLabel(log.action_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.metadata?.field_name ? getFieldLabel(log.metadata.field_name) : "Sistema"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.metadata?.old_value || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.metadata?.new_value || "-"}
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