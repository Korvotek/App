import { NextResponse } from "next/server";
import { syncContaAzulServices } from "@/actions/conta-azul-services";

export async function POST() {
  try {
    const result = await syncContaAzulServices();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Serviços sincronizados com sucesso",
        syncedCount: result.syncedCount,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao sincronizar serviços",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Erro ao sincronizar serviços:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}

