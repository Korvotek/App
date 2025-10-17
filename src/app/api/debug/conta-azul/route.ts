import { NextResponse } from "next/server";
import { getContaAzulConfig } from "@/lib/integrations/conta-azul";

export async function GET() {
  try {
    const config = getContaAzulConfig();
    
    return NextResponse.json({
      success: true,
      config: {
        authUrl: config.authUrl,
        tokenUrl: config.tokenUrl,
        apiBaseUrl: config.apiBaseUrl,
        scope: config.scope,
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret,
      },
      env: {
        hasPublicClientId: !!process.env.NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID,
        hasClientSecret: !!process.env.CONTA_AZUL_CLIENT_SECRET,
        publicClientId: process.env.NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      env: {
        hasPublicClientId: !!process.env.NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID,
        hasClientSecret: !!process.env.CONTA_AZUL_CLIENT_SECRET,
        publicClientId: process.env.NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID,
      }
    });
  }
}
