import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';

/**
 * Hook de exemplo para buscar dados de uma tabela
 * @param tableName - Nome da tabela no Supabase
 */
export function useSupabaseQuery<T>(tableName: string) {
  return useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data as T[];
    },
  });
}

/**
 * Hook de exemplo para inserir dados em uma tabela
 * @param tableName - Nome da tabela no Supabase
 */
export function useSupabaseInsert<T>(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const { data, error } = await supabase.from(tableName).insert(newData).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida a query para refazer a busca
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

/**
 * Hook de exemplo para atualizar dados em uma tabela
 * @param tableName - Nome da tabela no Supabase
 */
export function useSupabaseUpdate<T>(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Partial<T> }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

/**
 * Hook de exemplo para deletar dados de uma tabela
 * @param tableName - Nome da tabela no Supabase
 */
export function useSupabaseDelete(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

/**
 * Hook para verificar o status de autenticação
 */
export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });
}
