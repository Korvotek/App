import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getEventDetails, getEventAuditLogs } from "@/actions/event-edit-actions";
import type { EventUpdateData, CleaningConfigData, FinancialData } from "@/actions/event-edit-actions";

// Hook para buscar detalhes do evento
export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ["event-details", eventId],
    queryFn: () => getEventDetails(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar logs de auditoria do evento
export function useEventAuditLogs(eventId: string) {
  return useQuery({
    queryKey: ["event-audit-logs", eventId],
    queryFn: () => getEventAuditLogs(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para atualizar evento
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EventUpdateData) => {
      // Aqui será implementada a chamada para a API
      throw new Error("Função não implementada ainda");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-details", variables.id] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar evento");
    },
  });
}

// Hook para atualizar configuração de limpeza
export function useUpdateCleaningConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CleaningConfigData) => {
      // Aqui será implementada a chamada para a API
      throw new Error("Função não implementada ainda");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-details", variables.eventId] });
      toast.success("Configuração de limpeza atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configuração de limpeza");
    },
  });
}

// Hook para atualizar dados financeiros
export function useUpdateFinancialData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FinancialData) => {
      // Aqui será implementada a chamada para a API
      throw new Error("Função não implementada ainda");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-details", variables.eventId] });
      toast.success("Dados financeiros atualizados!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar dados financeiros");
    },
  });
}