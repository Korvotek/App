import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizationUrl, getContaAzulConfig } from "@/lib/integrations/conta-azul";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import {
  CONTA_AZUL_RETURN_TO_COOKIE,
  CONTA_AZUL_STATE_COOKIE,
} from "@/lib/integrations/conta-azul/constants";

export async function GET(request: NextRequest) {
  try {
    const { user, tenantId } = await getCurrentUserAndTenant();
    const config = getContaAzulConfig();

    const redirectUri = new URL(
      "/api/integrations/conta-azul/callback",
      request.nextUrl.origin,
    ).toString();

    const state = randomBytes(16).toString("hex");
    const payload = {
      state,
      tenantId,
      userId: user.id,
      issuedAt: Date.now(),
    };

    const encodedState = encodeURIComponent(
      Buffer.from(JSON.stringify(payload), "utf-8").toString("base64"),
    );

    const authorizeUrl = buildAuthorizationUrl({
      state,
      redirectUri,
      scopeOverride: config.scope,
    });

    const response = NextResponse.redirect(authorizeUrl.toString());

    response.cookies.set({
      name: CONTA_AZUL_STATE_COOKIE,
      value: encodedState,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });

    const returnTo =
      request.nextUrl.searchParams.get("return_to") ||
      "/dashboard/integracoes";

    response.cookies.set({
      name: CONTA_AZUL_RETURN_TO_COOKIE,
      value: encodeURIComponent(returnTo),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("autenticado")
    ) {
      const loginUrl = new URL(
        `/login?redirect=${encodeURIComponent("/dashboard/integracoes")}`,
        request.nextUrl.origin,
      );
      return NextResponse.redirect(loginUrl);
    }

    const message =
      error instanceof Error ? error.message : "Conta Azul indisponivel";
    const fallback = new URL(
      `/dashboard/integracoes?error=${encodeURIComponent(message)}`,
      request.nextUrl.origin,
    );
    return NextResponse.redirect(fallback);
  }
}

