import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";

export async function GET(request: NextRequest) {
  try {
    const { supabase, tenantId } = await getCurrentUserAndTenant();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
    const search = searchParams.get("search") ?? "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("conta_azul_services")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("synced_at", { ascending: false, nullsFirst: false });

    if (search.trim() !== "") {
      const normalized = search.trim();
      query = query.or(
        `description.ilike.%${normalized}%,code.ilike.%${normalized}%,external_code.ilike.%${normalized}%`,
      );
    }

    const { data: services, error, count } = await query.range(from, to);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      services: services ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(Math.ceil((count ?? 0) / limit), 1),
    });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

