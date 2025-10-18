"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removidos ícones: ArrowLeft, Edit, Save, X, AlertTriangle, History, DollarSign, Settings, Calendar, RefreshCw
import { useAuth } from "@/hooks/use-auth";
import { useEventDetails, useUpdateEvent } from "@/hooks/use-event-details";
import { toast } from "sonner";
import { EventDataTab } from "./event-data-tab";
import { EventFinancialTab } from "./event-financial-tab";
import { EventCleaningConfigTab } from "./event-cleaning-config-tab";
import { EventHistoryTab } from "./event-history-tab";
import { PermissionGate } from "@/components/auth/permission-gate";

interface EventDetailsProps {
  eventId: string;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router = useRouter();
  const { role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("data");

  const isReadOnly = role === "VIEWER";

  const { data: event, isLoading, error, refetch } = useEventDetails(eventId);
  const updateEventMutation = useUpdateEvent();

  const handleEdit = () => {
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleSave = async () => {
    try {
      // Aqui será implementada a lógica de salvamento
      toast.success("Evento salvo com sucesso!");
      setIsEditing(false);
      setHasUnsavedChanges(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar evento");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    refetch();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "RECEIVED": return "bg-blue-100 text-blue-800";
      case "VERIFIED": return "bg-yellow-100 text-yellow-800";
      case "SCHEDULED": return "bg-purple-100 text-purple-800";
      case "IN_PROGRESS": return "bg-orange-100 text-orange-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "BILLED": return "bg-indigo-100 text-indigo-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      case "INCOMPLETE": return "bg-red-100 text-red-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "DRAFT": return "Rascunho";
      case "RECEIVED": return "Recebido";
      case "VERIFIED": return "Verificado";
      case "SCHEDULED": return "Agendado";
      case "IN_PROGRESS": return "Em Andamento";
      case "COMPLETED": return "Concluído";
      case "BILLED": return "Faturado";
      case "CANCELLED": return "Cancelado";
      case "INCOMPLETE": return "Incompleto";
      case "CONFIRMED": return "Confirmado";
      default: return "Sem status";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Erro ao carregar evento: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              Evento não encontrado
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{event.title || `Evento ${event.event_number}`}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(event.status)}>
                {getStatusLabel(event.status)}
              </Badge>
              <span className="text-sm text-gray-500">
                {event.event_type || "Sem tipo"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isReadOnly && (
            <PermissionGate resource="events" action="update">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateEventMutation.isPending}
                    size="sm"
                  >
                    {updateEventMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  size="sm"
                >
                  Editar
                </Button>
              )}
            </PermissionGate>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">
            Dados
          </TabsTrigger>
          <TabsTrigger value="financial">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="cleaning">
            Limpezas
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <EventDataTab 
            event={event} 
            isEditing={isEditing} 
            isReadOnly={isReadOnly}
            onDataChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="financial">
          <EventFinancialTab 
            event={event} 
            isEditing={isEditing} 
            isReadOnly={isReadOnly}
            onDataChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="cleaning">
          <EventCleaningConfigTab 
            event={event} 
            isEditing={isEditing} 
            isReadOnly={isReadOnly}
            onDataChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="history">
          <EventHistoryTab eventId={eventId} />
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <span className="text-sm font-medium">
                Você tem alterações não salvas
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}