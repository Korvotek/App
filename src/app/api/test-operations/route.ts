import { NextRequest, NextResponse } from "next/server";
import { getOperations } from "@/actions/operations-actions";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 API Route - Testando getOperations...");
    
    const body = await request.json();
    const { page = 1, limit = 5 } = body;
    
    console.log("📋 Parâmetros recebidos:", { page, limit });
    
    const result = await getOperations({ page, limit });
    
    console.log("✅ API Route - Resultado obtido:", {
      operationsCount: result.operations.length,
      totalCount: result.totalCount
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("❌ API Route - Erro:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
