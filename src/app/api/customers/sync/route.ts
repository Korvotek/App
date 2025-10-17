import { NextResponse } from "next/server";
import { syncContaAzulCustomers } from "@/actions/conta-azul-customers";

export async function POST() {
  try {
    // Executar sincronização de clientes
    const result = await syncContaAzulCustomers();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Clientes sincronizados com sucesso",
        syncedCount: result.syncedCount,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: "Erro ao sincronizar clientes" 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao sincronizar clientes:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro interno do servidor" 
      },
      { status: 500 }
    );
  }
}
