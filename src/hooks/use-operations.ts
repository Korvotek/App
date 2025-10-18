import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOperationsSafe,
  createOperation,
  updateOperation,
  deleteOperation,
  getEventsForOperations,
  getDrivers,
  getVehicles,
  getWorkers,
} from "@/actions/operations-actions";
import type {
  GetOperationsOptions,
  OperationWithRelations,
  OperationsResponse,
} from "@/actions/operations-actions";

interface EnhancedError extends Error {
  originalError?: unknown;
  originalErrorType?: string;
  originalErrorString?: string;
  queryOptions?: GetOperationsOptions;
  timestamp?: string;
}

export interface UseOperationsOptions extends GetOperationsOptions {
  enabled?: boolean;
}

export function useOperations(options: UseOperationsOptions = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery<OperationsResponse<OperationWithRelations>>({
    queryKey: ["operations", queryOptions],
    queryFn: async () => {
      console.log("🔍 Hook useOperations - Iniciando query com opções:", queryOptions);
      try {
        // Usar a função segura para evitar problemas de serialização
        const result = await getOperationsSafe(queryOptions);
        console.log("✅ Hook useOperations - Resultado recebido:", {
          operationsCount: result.operations.length,
          totalCount: result.totalCount,
          totalPages: result.totalPages
        });
        
        // Validar se o resultado tem a estrutura esperada
        if (!result || typeof result !== 'object') {
          throw new Error("Resposta inválida do servidor: resultado não é um objeto");
        }
        
        if (!Array.isArray(result.operations)) {
          throw new Error("Resposta inválida do servidor: operations não é um array");
        }
        
        return result;
      } catch (error) {
        console.error("❌ Hook useOperations - Erro na query:", error);
        console.error("❌ Tipo do erro:", typeof error);
        console.error("❌ Erro é instância de Error:", error instanceof Error);
        console.error("❌ Stack do erro:", error instanceof Error ? error.stack : "N/A");
        console.error("❌ Mensagem do erro:", error instanceof Error ? error.message : String(error));
        console.error("❌ Erro completo:", JSON.stringify(error, null, 2));
        
        // Criar um erro mais informativo
        const enhancedError = new Error(
          `Erro ao carregar operações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
        
        // Adicionar informações extras ao erro
        (enhancedError as EnhancedError).originalError = error;
        (enhancedError as EnhancedError).originalErrorType = typeof error;
        (enhancedError as EnhancedError).originalErrorString = String(error);
        (enhancedError as EnhancedError).queryOptions = queryOptions;
        (enhancedError as EnhancedError).timestamp = new Date().toISOString();
        
        throw enhancedError;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: (failureCount, error) => {
      console.log(`🔄 Hook useOperations - Tentativa ${failureCount + 1} falhou:`, error);
      return failureCount < 2; // Reduzir tentativas para debug mais rápido
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Reduzir delay máximo
  });
}

export function useEventsForOperations() {
  return useQuery({
    queryKey: ["events-for-operations"],
    queryFn: getEventsForOperations,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useWorkers() {
  return useQuery({
    queryKey: ["workers"],
    queryFn: getWorkers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
  });
}

export function useUpdateOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateOperation(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
  });
}

export function useDeleteOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
  });
}
