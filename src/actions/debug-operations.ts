"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";

export async function debugOperationsConnection() {
  try {
    console.log("🔍 Iniciando debug da conexão com operações...");
    
    // Teste 1: Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("📋 Variáveis de ambiente:");
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida");
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Definida" : "❌ Não definida");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Variáveis de ambiente do Supabase não estão definidas");
    }
    
    // Teste 2: Criar cliente Supabase
    console.log("🔗 Criando cliente Supabase...");
    const supabase = await createServerClient();
    console.log("✅ Cliente Supabase criado com sucesso");
    
    // Teste 3: Verificar autenticação
    console.log("🔐 Verificando autenticação...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log("❌ Erro de autenticação:", userError.message);
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    if (!user) {
      console.log("❌ Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }
    
    console.log("✅ Usuário autenticado:", user.email);
    
    // Teste 4: Verificar tenant
    console.log("🏢 Verificando tenant...");
    const { user: userData, tenantId, supabase: tenantSupabase } = await getCurrentUserAndTenant();
    console.log("✅ Tenant ID:", tenantId);
    
    // Teste 5: Testar query simples
    console.log("📊 Testando query simples...");
    const { data: simpleData, error: simpleError } = await tenantSupabase
      .from("event_operations")
      .select("id")
      .eq("tenant_id", tenantId)
      .limit(1);
    
    if (simpleError) {
      console.log("❌ Erro na query simples:", simpleError.message);
      throw new Error(`Erro na query simples: ${simpleError.message}`);
    }
    
    console.log("✅ Query simples executada com sucesso");
    console.log("📈 Operações encontradas:", simpleData?.length || 0);
    
    // Teste 6: Testar query complexa
    console.log("🔍 Testando query complexa...");
    const { data: complexData, error: complexError } = await tenantSupabase
      .from("event_operations")
      .select(`
        *,
        events(
          title, 
          event_number, 
          description,
          event_locations!event_locations_event_id_fkey(
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code
          )
        ),
        parties!event_operations_driver_id_fkey(display_name),
        vehicles!event_operations_vehicle_id_fkey(license_plate, model, brand)
      `)
      .eq("tenant_id", tenantId)
      .limit(1);
    
    if (complexError) {
      console.log("❌ Erro na query complexa:", complexError.message);
      throw new Error(`Erro na query complexa: ${complexError.message}`);
    }
    
    console.log("✅ Query complexa executada com sucesso");
    console.log("📈 Operações com relações encontradas:", complexData?.length || 0);
    
    return {
      success: true,
      message: "Todos os testes passaram com sucesso",
      data: {
        userEmail: user.email,
        tenantId,
        simpleQueryCount: simpleData?.length || 0,
        complexQueryCount: complexData?.length || 0,
      }
    };
    
  } catch (error) {
    console.error("❌ Erro no debug:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
      error: error instanceof Error ? error.stack : String(error)
    };
  }
}

