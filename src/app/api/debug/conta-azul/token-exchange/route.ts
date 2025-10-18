import { NextRequest, NextResponse } from "next/server";
import { getContaAzulConfig } from "@/lib/integrations/conta-azul";

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return NextResponse.json({
        success: false,
        error: "code and redirectUri are required"
      });
    }

    const config = getContaAzulConfig();

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    });

    const authHeader = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString("base64");

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "Sigelo/ContaAzulIntegration (+https://sigelo.app)",
      },
      body,
      cache: "no-store",
    });

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      config: {
        tokenUrl: config.tokenUrl,
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret,
        clientIdLength: config.clientId?.length || 0,
        clientSecretLength: config.clientSecret?.length || 0
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
