import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";

export async function GET(request: NextRequest) {
  try {
    const { supabase, tenantId } = await getCurrentUserAndTenant();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construir query com filtros
    let query = supabase
      .from("conta_azul_customers")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("synced_at", { ascending: false, nullsFirst: false });

    // Adicionar filtro de busca se fornecido
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,document.ilike.%${search}%`
      );
    }

    // Executar query com paginação
    const { data: customers, error, count } = await query.range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      customers: customers || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
