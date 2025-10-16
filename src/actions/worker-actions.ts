"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import {
  workerRegistrationSchema,
  type WorkerRegistrationData,
} from "@/lib/validations/worker-schema";
import type { Database } from "@/lib/supabase/database.types";

type PartyInsert = Database["public"]["Tables"]["parties"]["Insert"];
type PartyContactInsert =
  Database["public"]["Tables"]["party_contacts"]["Insert"];
type PartyEmployeeInsert =
  Database["public"]["Tables"]["party_employees"]["Insert"];

export async function registerWorker(formData: WorkerRegistrationData) {
  const { user, tenantId, supabase } = await getCurrentUserAndTenant();
  const validatedData = workerRegistrationSchema.parse(formData);

  try {
    const partyData: PartyInsert = {
      tenant_id: tenantId,
      party_type: "EMPLOYEE",
      display_name: validatedData.display_name,
      full_name: validatedData.display_name,
      cpf: validatedData.cpf,
      active: true,
    };

    const { data: party, error: partyError } = await supabase
      .from("parties")
      .insert(partyData)
      .select()
      .single();

    if (partyError) {
      throw new Error(`Erro ao criar funcionário: ${partyError.message}`);
    }

    const contactsData: PartyContactInsert[] = [];

    if (validatedData.phone && validatedData.phone.trim() !== "") {
      contactsData.push({
        tenant_id: tenantId,
        party_id: party.id,
        contact_type: "PHONE",
        contact_value: validatedData.phone,
        is_primary: true,
      });
    }

    if (validatedData.email && validatedData.email.trim() !== "") {
      contactsData.push({
        tenant_id: tenantId,
        party_id: party.id,
        contact_type: "EMAIL",
        contact_value: validatedData.email,
        is_primary: contactsData.length === 0,
      });
    }

    const { error: contactsError } = await supabase
      .from("party_contacts")
      .insert(contactsData);

    if (contactsError) {
      throw new Error(`Erro ao criar contatos: ${contactsError.message}`);
    }

    const employeeData: PartyEmployeeInsert = {
      tenant_id: tenantId,
      party_id: party.id,
      employee_number: validatedData.employee_number,
      hire_date: validatedData.hire_date,
      is_driver: validatedData.is_driver,
      is_helper: validatedData.is_helper,
    };

    const { error: employeeError } = await supabase
      .from("party_employees")
      .insert(employeeData);

    if (employeeError) {
      throw new Error(
        `Erro ao criar registro de funcionário: ${employeeError.message}`,
      );
    }

    const { error: roleError } = await supabase.from("party_roles").insert({
      tenant_id: tenantId,
      party_id: party.id,
      role_type: "EMPLOYEE",
      is_primary: true,
      active: true,
    });

    if (roleError) {
      throw new Error(`Erro ao criar função: ${roleError.message}`);
    }

    await supabase.from("activity_logs").insert({
      tenant_id: tenantId,
      user_id: user.id,
      action_type: "CREATE_EMPLOYEE",
      entity_id: party.id,
      entity_type: "party",
      success: true,
      metadata: {
        employee_number: validatedData.employee_number,
        display_name: validatedData.display_name,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar funcionário:", error);
    throw error;
  }

  revalidatePath("/dashboard/funcionarios");
  return { success: true, message: "Funcionário cadastrado com sucesso!" };
}

export async function getWorkers(page: number = 1, limit: number = 12) {
  const { tenantId, supabase } = await getCurrentUserAndTenant();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count: totalCount, error: countError } = await supabase
    .from("parties")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("party_type", "EMPLOYEE")
    .eq("active", true);

  if (countError) {
    console.error("Error counting workers:", countError);
    return null;
  }
  const { data: workers, error } = await supabase
    .from("parties")
    .select(
      `
      id,
      display_name,
      full_name,
      cpf,
      active,
      party_employees (
        employee_number,
        hire_date,
        is_driver,
        is_helper
      ),
      party_contacts (
        contact_type,
        contact_value,
        is_primary
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("party_type", "EMPLOYEE")
    .eq("active", true)
    .order("display_name")
    .range(from, to);

  if (error) {
    console.error("Error fetching workers:", error);
    return null;
  }

  return {
    workers: workers || [],
    totalCount: totalCount || 0,
    totalPages: Math.ceil((totalCount || 0) / limit),
    currentPage: page,
    limit,
  };
}
