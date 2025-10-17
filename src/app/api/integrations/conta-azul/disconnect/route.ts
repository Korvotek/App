import { NextResponse } from "next/server";
import {
  CONTA_AZUL_PROVIDER,
  revokeContaAzulToken,
} from "@/lib/integrations/conta-azul";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import {
  deleteTenantIntegrationToken,
  findTenantIntegrationToken,
} from "@/lib/integrations/storage";

export async function POST() {
  try {
    const { supabase, tenantId } = await getCurrentUserAndTenant();

    const existing = await findTenantIntegrationToken({
      supabase,
      tenantId,
      provider: CONTA_AZUL_PROVIDER,
    });

    if (!existing) {
      return NextResponse.json({ success: true, disconnected: false });
    }

    if (existing.access_token) {
      await revokeContaAzulToken({
        token: existing.access_token,
        tokenTypeHint: "access_token",
      });
    }

    if (existing.refresh_token) {
      await revokeContaAzulToken({
        token: existing.refresh_token,
        tokenTypeHint: "refresh_token",
      });
    }

    await deleteTenantIntegrationToken({
      supabase,
      tenantId,
      provider: CONTA_AZUL_PROVIDER,
    });

    return NextResponse.json({ success: true, disconnected: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("autenticado")
    ) {
      return NextResponse.json(
        { success: false, error: "Usuario nao autenticado" },
        { status: 401 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Falha ao desconectar da Conta Azul";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
