"use server";

import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { ContaAzulClient } from "@/lib/contaazul/client";
import type { 
  ContaAzulIntegration, 
  ContaAzulSyncResult
} from "@/lib/contaazul/types";

// Helper function para mapear integration_tokens para ContaAzulIntegration
function mapIntegrationTokenToContaAzulIntegration(
  token: {
    id: string;
    access_token: string;
    refresh_token: string | null;
    expires_at: string | null;
    scope: string | null;
    metadata: unknown;
    created_at: string;
    updated_at: string;
  },
  userId: string
): ContaAzulIntegration {
  const metadata = token.metadata as { client_id?: string; client_secret?: string } || {};
  
  return {
    id: token.id,
    tenant_id: userId, // Usando userId como tenant_id temporariamente
    client_id: metadata.client_id || "",
    client_secret: metadata.client_secret || "",
    access_token: token.access_token,
    refresh_token: token.refresh_token || undefined,
    expires_at: token.expires_at ? new Date(token.expires_at).getTime() : undefined,
    scope: token.scope || undefined,
    active: !!token.access_token,
    last_sync_at: token.updated_at,
    created_at: token.created_at,
    updated_at: token.updated_at,
  };
}

export async function createContaAzulIntegration(
  clientId: string,
  clientSecret: string
): Promise<ContaAzulIntegration | null> {
  const { user, supabase } = await getCurrentUserAndTenant();

  try {
    // Primeiro, vamos verificar se já existe uma integração
    const { data: existingIntegration } = await supabase
      .from("integration_tokens")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "contaazul")
      .single();

    if (existingIntegration) {
      // Atualizar a integração existente
      const { data: integration, error } = await supabase
        .from("integration_tokens")
        .update({
          access_token: "", // Será preenchido após OAuth
          metadata: {
            client_id: clientId,
            client_secret: clientSecret,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating ContaAzul integration:", error);
        return null;
      }

      return mapIntegrationTokenToContaAzulIntegration(integration, user.id);
    } else {
      // Criar nova integração
      const { data: integration, error } = await supabase
        .from("integration_tokens")
        .insert({
          user_id: user.id,
          provider: "contaazul",
          access_token: "", // Será preenchido após OAuth
          metadata: {
            client_id: clientId,
            client_secret: clientSecret,
          },
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating ContaAzul integration:", error);
        return null;
      }

      return mapIntegrationTokenToContaAzulIntegration(integration, user.id);
    }
  } catch (error) {
    console.error("Unexpected error creating integration:", error);
    return null;
  }
}

export async function getContaAzulIntegration(): Promise<ContaAzulIntegration | null> {
  const { user, supabase } = await getCurrentUserAndTenant();

  try {
    const { data: integration, error } = await supabase
      .from("integration_tokens")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "contaazul")
      .single();

    if (error) {
      console.error("Error fetching ContaAzul integration:", error);
      return null;
    }

    return mapIntegrationTokenToContaAzulIntegration(integration, user.id);
  } catch (error) {
    console.error("Unexpected error fetching integration:", error);
    return null;
  }
}

export async function updateContaAzulTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  scope?: string
): Promise<boolean> {
  const { user, supabase } = await getCurrentUserAndTenant();

  try {
    const { error } = await supabase
      .from("integration_tokens")
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(expiresAt).toISOString(),
        scope: scope,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("provider", "contaazul");

    if (error) {
      console.error("Error updating ContaAzul tokens:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating tokens:", error);
    return false;
  }
}

export async function getContaAzulAuthUrl(): Promise<string | null> {
  const integration = await getContaAzulIntegration();
  
  if (!integration) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: integration.client_id,
    response_type: 'code',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul/callback`,
    scope: 'read write',
    state: integration.tenant_id,
  });

  return `https://api.contaazul.com/oauth/authorize?${params.toString()}`;
}

export async function handleContaAzulCallback(
  code: string
): Promise<ContaAzulSyncResult> {
  const integration = await getContaAzulIntegration();
  
  if (!integration) {
    return {
      success: false,
      message: "Integração não encontrada",
      error: "Integration not found",
    };
  }

  try {
    const client = new ContaAzulClient();
    const token = await client.exchangeCodeForToken(
      code,
      integration.client_id,
      integration.client_secret,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integracao/contaazul/callback`
    );

    const success = await updateContaAzulTokens(
      token.access_token,
      token.refresh_token,
      token.expires_at,
      token.scope
    );

    if (!success) {
      return {
        success: false,
        message: "Erro ao salvar tokens de acesso",
        error: "Failed to save tokens",
      };
    }

    return {
      success: true,
      message: "Integração configurada com sucesso!",
    };
  } catch (error) {
    console.error("Error handling ContaAzul callback:", error);
    return {
      success: false,
      message: "Erro ao configurar integração",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function syncContaAzulData(): Promise<ContaAzulSyncResult> {
  const integration = await getContaAzulIntegration();
  
  if (!integration || !integration.access_token) {
    return {
      success: false,
      message: "Integração não configurada",
      error: "Integration not configured",
    };
  }

  try {
    const client = new ContaAzulClient();
    client.setAccessToken(integration.access_token);

    // Verificar se o token ainda é válido
    const isConnected = await client.testConnection();
    if (!isConnected) {
      return {
        success: false,
        message: "Token expirado. Reconfigure a integração.",
        error: "Token expired",
      };
    }

    // Sincronizar dados (exemplo básico)
    const [customersResult, productsResult, salesResult] = await Promise.allSettled([
      client.getCustomers(1, 100),
      client.getProducts(1, 100),
      client.getSales(1, 100),
    ]);

    const customers = customersResult.status === 'fulfilled' ? customersResult.value.data.length : 0;
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data.length : 0;
    const sales = salesResult.status === 'fulfilled' ? salesResult.value.data.length : 0;

    // Atualizar timestamp da última sincronização
    const { supabase } = await getCurrentUserAndTenant();
    await supabase
      .from("integration_tokens")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", integration.tenant_id)
      .eq("provider", "contaazul");

    return {
      success: true,
      message: `Sincronização concluída! ${customers} clientes, ${products} produtos, ${sales} vendas.`,
      data: {
        customers,
        products,
        sales,
      },
    };
  } catch (error) {
    console.error("Error syncing ContaAzul data:", error);
    return {
      success: false,
      message: "Erro durante a sincronização",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function disconnectContaAzul(): Promise<boolean> {
  const { user, supabase } = await getCurrentUserAndTenant();

  try {
    const { error } = await supabase
      .from("integration_tokens")
      .update({
        access_token: "",
        refresh_token: null,
        expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("provider", "contaazul");

    if (error) {
      console.error("Error disconnecting ContaAzul:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error disconnecting:", error);
    return false;
  }
}
