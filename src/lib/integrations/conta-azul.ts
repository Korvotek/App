import { headers } from "next/headers";

const LOG_PREFIX = "[integrations/conta-azul]";

export const CONTA_AZUL_PROVIDER = "conta_azul";
const DEFAULT_AUTH_URL = "https://api.contaazul.com/oauth2/authorize";
const DEFAULT_TOKEN_URL = "https://api.contaazul.com/oauth2/token";
const DEFAULT_API_BASE_URL = "https://api.contaazul.com";
const DEFAULT_SCOPE = "offline_access sales finance";

interface ContaAzulConfig {
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface ContaAzulTokenPayload {
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  scope: string | null;
  expiresAt: string | null;
  raw: Record<string, unknown>;
}

interface ContaAzulTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number | string;
  scope?: string;
  error?: string;
  error_description?: string;
  [key: string]: unknown;
}

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

function sanitizeScope(rawScope: string | undefined | null) {
  if (!rawScope) {
    return DEFAULT_SCOPE;
  }
  return rawScope
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

export function getContaAzulConfig(): ContaAzulConfig {
  const clientId = process.env.CONTA_AZUL_CLIENT_ID;
  const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Variaveis de ambiente CONTA_AZUL_CLIENT_ID e CONTA_AZUL_CLIENT_SECRET sao obrigatorias",
    );
  }

  const authUrl =
    process.env.CONTA_AZUL_AUTH_URL?.trim() || DEFAULT_AUTH_URL;
  const tokenUrl =
    process.env.CONTA_AZUL_TOKEN_URL?.trim() || DEFAULT_TOKEN_URL;
  const apiBaseUrl =
    process.env.CONTA_AZUL_API_BASE_URL?.replace(/\/+$/, "") ||
    DEFAULT_API_BASE_URL;
  const scope = sanitizeScope(process.env.CONTA_AZUL_SCOPES);

  return {
    authUrl,
    tokenUrl,
    apiBaseUrl,
    clientId,
    clientSecret,
    scope,
  };
}

export function buildAuthorizationUrl(params: {
  state: string;
  redirectUri: string;
  scopeOverride?: string;
}) {
  const config = getContaAzulConfig();
  const scope = sanitizeScope(params.scopeOverride ?? config.scope);

  const url = new URL(config.authUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", params.state);

  return url;
}

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
}): Promise<ContaAzulTokenPayload> {
  const config = getContaAzulConfig();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const authHeader = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  logDebug("Exchanging authorization code for tokens");
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent":
        headers().get("user-agent") ??
        "Sigelo/ContaAzulIntegration (+https://sigelo.app)",
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json()) as ContaAzulTokenResponse;

  if (!response.ok) {
    throw new Error(
      payload.error_description ||
        payload.error ||
        "Nao foi possivel obter o token de acesso da Conta Azul",
    );
  }

  if (!payload.access_token) {
    throw new Error("Resposta da Conta Azul nao contem access_token");
  }

  const expiresInSeconds =
    typeof payload.expires_in === "number"
      ? payload.expires_in
      : typeof payload.expires_in === "string"
        ? Number.parseInt(payload.expires_in, 10)
        : null;

  const expiresAt =
    expiresInSeconds && !Number.isNaN(expiresInSeconds)
      ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
      : null;

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    tokenType: payload.token_type ?? "Bearer",
    scope: sanitizeScope(payload.scope),
    expiresAt,
    raw: payload as Record<string, unknown>,
  };
}

export async function revokeContaAzulToken(params: {
  token: string;
  tokenTypeHint?: string;
}) {
  const revokeUrl = process.env.CONTA_AZUL_REVOKE_URL;
  if (!revokeUrl) {
    logDebug("No revoke URL configured, skipping remote revocation");
    return;
  }

  const config = getContaAzulConfig();
  const authHeader = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  try {
    logDebug("Revoking Conta Azul token remotely");
    const response = await fetch(revokeUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent":
          headers().get("user-agent") ??
          "Sigelo/ContaAzulIntegration (+https://sigelo.app)",
      },
      body: new URLSearchParams({
        token: params.token,
        ...(params.tokenTypeHint ? { token_type_hint: params.tokenTypeHint } : {}),
      }),
    });

    if (!response.ok) {
      logDebug("Conta Azul revoke endpoint returned a non-OK status", {
        status: response.status,
      });
    }
  } catch (error) {
    logDebug("Failed to revoke Conta Azul token remotely", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function fetchContaAzulAccountSummary(accessToken: string) {
  const config = getContaAzulConfig();
  const endpoint = `${config.apiBaseUrl.replace(/\/+$/, "")}/v1/users/current`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent":
          headers().get("user-agent") ??
          "Sigelo/ContaAzulIntegration (+https://sigelo.app)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      logDebug("Conta Azul account summary endpoint returned non-OK", {
        status: response.status,
      });
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;
    return data;
  } catch (error) {
    logDebug("Failed to fetch Conta Azul account summary", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

