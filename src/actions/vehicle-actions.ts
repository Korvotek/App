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
  const { user, tenantId, supabase } = await getCurrentUserAndTenant();
  const validatedData = vehicleRegistrationSchema.parse(formData);

  try {
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

    await supabase.from("activity_logs").insert({
      tenant_id: tenantId,
      user_id: user.id,
      action_type: "CREATE_EMPLOYEE",
      entity_id: vehicle.id,
      entity_type: "vehicle",
      success: true,
      metadata: {
        license_plate: validatedData.license_plate,
        brand: validatedData.brand,
        model: validatedData.model,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar veículo:", error);
    throw error;
  }

  revalidatePath("/dashboard/veiculos");
  return { success: true, message: "Veículo cadastrado com sucesso!" };
}

export async function getVehicles(page: number = 1, limit: number = 12) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count: totalCount, error: countError } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("active", true);

  if (countError) {
    console.error("Error counting vehicles:", countError);
    return null;
  }
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(
      `
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
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("brand")
    .range(from, to);

  if (error) {
    console.error("Error fetching vehicles:", error);
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
