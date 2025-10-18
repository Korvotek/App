import { NextRequest, NextResponse } from "next/server";
import {
  CONTA_AZUL_RETURN_TO_COOKIE,
  CONTA_AZUL_STATE_COOKIE,
} from "@/lib/integrations/conta-azul/constants";
import {
  CONTA_AZUL_PROVIDER,
  exchangeCodeForTokens,
  fetchContaAzulAccountSummary,
} from "@/lib/integrations/conta-azul";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { upsertTenantIntegrationToken } from "@/lib/integrations/storage";

function decodeStateCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;

  try {
    const decoded = Buffer.from(
      decodeURIComponent(cookieValue),
      "base64",
    ).toString("utf-8");
    return JSON.parse(decoded) as {
      state: string;
      tenantId: string;
      userId: string;
      issuedAt?: number;
    };
  } catch {
    return null;
  }
}

function buildRedirect(origin: string, target?: string | null) {
  if (target) {
    try {
      const url = new URL(target, origin);
      return url.toString();
    } catch {
    }
  }
  return new URL("/dashboard/integracoes", origin).toString();
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const remoteError = request.nextUrl.searchParams.get("error");

  const statePayload = decodeStateCookie(
    request.cookies.get(CONTA_AZUL_STATE_COOKIE)?.value,
  );
  const returnToCookie = request.cookies.get(
    CONTA_AZUL_RETURN_TO_COOKIE,
  )?.value;

  const cleanupCookies = (response: NextResponse) => {
    response.cookies.delete(CONTA_AZUL_STATE_COOKIE);
    response.cookies.delete(CONTA_AZUL_RETURN_TO_COOKIE);
  };

  if (remoteError) {
    const redirectUrl = new URL("/dashboard/integracoes", origin);
    redirectUrl.searchParams.set("error", remoteError);

    const response = NextResponse.redirect(redirectUrl);
    cleanupCookies(response);
    return response;
  }

  if (!code || !stateParam || !statePayload) {
    const redirectUrl = new URL("/dashboard/integracoes", origin);
    redirectUrl.searchParams.set(
      "error",
      "Nao foi possivel concluir a autenticacao com a Conta Azul.",
    );

    const response = NextResponse.redirect(redirectUrl);
    cleanupCookies(response);
    return response;
  }

  if (statePayload.state !== stateParam) {
    const redirectUrl = new URL("/dashboard/integracoes", origin);
    redirectUrl.searchParams.set(
      "error",
      "A validacao de seguranca da Conta Azul expirou. Tente novamente.",
    );

    const response = NextResponse.redirect(redirectUrl);
    cleanupCookies(response);
    return response;
  }

  try {
    const { supabase, user, tenantId } = await getCurrentUserAndTenant();

    if (user.id !== statePayload.userId) {
      throw new Error(
        "O usuario autenticado e diferente do usuario que iniciou a conexao",
      );
    }

    if (tenantId !== statePayload.tenantId) {
      throw new Error(
        "O tenant atual e diferente do tenant que iniciou a conexao",
      );
    }

    const redirectUri = new URL(
      "/api/integrations/conta-azul/callback",
      origin,
    ).toString();

    const token = await exchangeCodeForTokens({
      code,
      redirectUri,
    });

    const accountSummary = await fetchContaAzulAccountSummary(
      token.accessToken,
    );

    await upsertTenantIntegrationToken({
      supabase,
      provider: CONTA_AZUL_PROVIDER,
      tenantId,
      userId: user.id,
      token,
      accountSummary,
    });

    let decodedReturnTo: string | null = null;
    if (returnToCookie) {
      try {
        decodedReturnTo = decodeURIComponent(returnToCookie);
      } catch {
        decodedReturnTo = null;
      }
    }

    const redirectTarget = buildRedirect(origin, decodedReturnTo);

    const url = new URL(redirectTarget);
    url.searchParams.set("status", "conta_azul_connected");

    const response = NextResponse.redirect(url);
    cleanupCookies(response);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao conectar com a Conta Azul";

    const redirectUrl = new URL("/dashboard/integracoes", origin);
    redirectUrl.searchParams.set("error", message);

    const response = NextResponse.redirect(redirectUrl);
    cleanupCookies(response);
    return response;
  }
}

