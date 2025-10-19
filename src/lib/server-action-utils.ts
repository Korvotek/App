"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServerActionOptions {
  revalidatePaths?: string[];
  logAction?: boolean;
}

export async function executeServerAction<T>(
  action: () => Promise<T>,
  options: ServerActionOptions = {}
): Promise<ServerActionResult<T>> {
  try {
    if (options.logAction) {
      console.log("🚀 Executando Server Action...");
    }

    const result = await action();

    // Revalidar paths se especificado
    if (options.revalidatePaths) {
      options.revalidatePaths.forEach(path => {
        revalidatePath(path);
      });
    }

    if (options.logAction) {
      console.log("✅ Server Action executada com sucesso");
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("❌ Erro na Server Action:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erro desconhecido na operação";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function withAuth<T>(
  action: (context: { user: User; tenantId: string; supabase: SupabaseClient<Database> }) => Promise<T>,
  options: ServerActionOptions = {}
): Promise<ServerActionResult<T>> {
  return executeServerAction(async () => {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();
    return action({ user, tenantId, supabase });
  }, options);
}

import { z } from "zod";

export async function withValidation<T, V>(
  schema: z.ZodSchema<T>,
  data: V,
  action: (validatedData: T) => Promise<unknown>,
  options: ServerActionOptions = {}
): Promise<ServerActionResult> {
  return executeServerAction(async () => {
    const validatedData = schema.parse(data);
    return action(validatedData);
  }, options);
}

export async function withAuthAndValidation<T, V>(
  schema: z.ZodSchema<T>,
  data: V,
  action: (context: { user: User; tenantId: string; supabase: SupabaseClient<Database> }, validatedData: T) => Promise<unknown>,
  options: ServerActionOptions = {}
): Promise<ServerActionResult> {
  return executeServerAction(async () => {
    const { user, tenantId, supabase } = await getCurrentUserAndTenant();
    const validatedData = schema.parse(data);
    return action({ user, tenantId, supabase }, validatedData);
  }, options);
}
