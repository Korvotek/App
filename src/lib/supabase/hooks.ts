import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./client";
import type { Database } from "./database.types";

type TableName = keyof Database["public"]["Tables"];

export function useSupabaseQuery<T>(tableName: TableName) {
  return useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useSupabaseInsert<T>(tableName: TableName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(newData as never)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

export function useSupabaseUpdate<T>(tableName: TableName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string | number;
      updates: Partial<T>;
    }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates as never)
        .eq("id", String(id))
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

export function useSupabaseDelete(tableName: TableName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", String(id));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });
}
