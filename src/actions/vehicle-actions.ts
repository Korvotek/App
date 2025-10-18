"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import {
  vehicleRegistrationSchema,
  type VehicleRegistrationData,
} from "@/lib/validations/vehicle-schema";
import type { Database } from "@/lib/supabase/database.types";

type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];

export async function registerVehicle(formData: VehicleRegistrationData) {
  const { withAuthAndValidation } = await import("@/lib/server-action-utils");
  
  return withAuthAndValidation(
    vehicleRegistrationSchema,
    formData,
    async ({ user, tenantId, supabase }, validatedData) => {
      const vehicleData: VehicleInsert = {
        tenant_id: tenantId,
        brand: validatedData.brand,
        model: validatedData.model,
        license_plate: validatedData.license_plate,
        year: validatedData.year,
        vehicle_type: validatedData.vehicle_type || null,
        fuel_type: validatedData.fuel_type || null,
        module_capacity: validatedData.module_capacity || null,
        active: true,
      };

      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert(vehicleData)
        .select()
        .single();

      if (vehicleError) {
        throw new Error(`Erro ao criar veículo: ${vehicleError.message}`);
      }

      // Log da atividade
      await supabase.from("activity_logs").insert({
        tenant_id: tenantId,
        user_id: user.id,
        action_type: "ASSIGN_VEHICLE",
        entity_id: vehicle.id,
        entity_type: "vehicle",
        success: true,
        metadata: {
          license_plate: validatedData.license_plate,
          brand: validatedData.brand,
          model: validatedData.model,
        },
      });

      return { message: "Veículo cadastrado com sucesso!" };
    },
    {
      revalidatePaths: ["/dashboard/veiculos"],
      logAction: true,
    }
  );
}

export async function getVehicles(page: number = 1, limit: number = 12, search?: string) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let countQuery = supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("active", true);

  let dataQuery = supabase
    .from("vehicles")
    .select(`
      id,
      brand,
      model,
      license_plate,
      year,
      vehicle_type,
      fuel_type,
      module_capacity,
      active,
      created_at
    `)
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("brand")
    .range(from, to);

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    countQuery = countQuery.or(`brand.ilike.${searchTerm},model.ilike.${searchTerm},license_plate.ilike.${searchTerm}`);
    dataQuery = dataQuery.or(`brand.ilike.${searchTerm},model.ilike.${searchTerm},license_plate.ilike.${searchTerm}`);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    return null;
  }

  const { data: vehicles, error } = await dataQuery;

  if (error) {
    return null;
  }

  return {
    vehicles: vehicles || [],
    totalCount: totalCount || 0,
    totalPages: Math.ceil((totalCount || 0) / limit),
    currentPage: page,
    limit,
  };
}
