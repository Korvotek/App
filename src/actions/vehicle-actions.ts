"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  vehicleRegistrationSchema,
  type VehicleRegistrationData,
} from "@/lib/validations/vehicle-schema";
import type { Database } from "@/lib/supabase/database.types";

type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];

export async function registerVehicle(formData: VehicleRegistrationData) {
  const supabase = await createServerClient();

  // Get current user and tenant
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userDataError || !userData?.tenant_id) {
    throw new Error("Tenant não encontrado");
  }

  const tenantId = userData.tenant_id;

  // Validate form data
  const validatedData = vehicleRegistrationSchema.parse(formData);

  try {
    // Create vehicle
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

    // Log activity
    await supabase.from("activity_logs").insert({
      tenant_id: tenantId,
      user_id: user.id,
      action_type: "CREATE_EMPLOYEE", // Using existing action type
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
  redirect("/dashboard/veiculos?success=true");
}

export async function getVehicles(page: number = 1, limit: number = 12) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userDataError || !userData?.tenant_id) {
    throw new Error("Tenant não encontrado");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", userData.tenant_id)
    .eq("active", true);

  if (countError) {
    console.error("Error counting vehicles:", countError);
    return null;
  }

  // Get paginated vehicles
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
    .eq("tenant_id", userData.tenant_id)
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
