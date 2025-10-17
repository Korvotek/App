import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/permission-gate";
import { ContaAzulDisconnectButton } from "@/components/integrations/conta-azul-disconnect-button";
import { getCurrentUserAndTenant } from "@/lib/auth/server-helpers";
import { findTenantIntegrationToken } from "@/lib/integrations/storage";
import { CONTA_AZUL_PROVIDER } from "@/lib/integrations/conta-azul";
import { Building2, Plug2, ShieldAlert } from "lucide-react";

function formatDateTime(isoDate: string | null | undefined) {
  if (!isoDate) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(isoDate));
  } catch {
    return null;
  }
}

export default async function IntegracoesPage() {
  const { supabase, tenantId } = await getCurrentUserAndTenant();

  const contaAzulToken = await findTenantIntegrationToken({
    supabase,
    tenantId,
    provider: CONTA_AZUL_PROVIDER,
  });

  const metadata =
    (contaAzulToken?.metadata as Record<string, unknown> | null) ?? null;

  const connectedById =
    (metadata?.connected_by as string | undefined) ?? null;

  let connectedByName: string | null = null;

  if (connectedById) {
    const { data: connectedRow } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", connectedById)
      .maybeSingle();

    if (connectedRow) {
      connectedByName =
        connectedRow.full_name || connectedRow.email || null;
    }
  }

  const lastSyncIso =
    (metadata?.last_synced_at as string | undefined) ??
    (metadata?.last_refreshed_at as string | undefined) ??
    contaAzulToken?.updated_at ??
    contaAzulToken?.created_at ??
    null;

  const connectedAtIso =
    (metadata?.connected_at as string | undefined) ??
    contaAzulToken?.created_at ??
    null;

  const lastSyncFormatted = formatDateTime(lastSyncIso);
  const connectedAtFormatted = formatDateTime(connectedAtIso);

  const accountSummary =
    (metadata?.account_summary as Record<string, unknown> | null) ??
    null;

  const organizationName =
    (accountSummary?.name as string | undefined) ??
    (accountSummary?.company_name as string | undefined) ??
    null;

  const status = contaAzulToken ? "connected" : "disconnected";
  const connectUrl = "/api/integrations/conta-azul/authorize";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Integracoes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Conecte o Sigelo aos seus sistemas externos para automatizar o
          faturamento e manter todas as informacoes sincronizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="rounded-xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100">
              <Plug2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">Conta Azul</CardTitle>
                  <CardDescription>Sistema de gestao financeira</CardDescription>
                </div>
                <Badge
                  variant={status === "connected" ? "default" : "secondary"}
                  className={
                    status === "connected"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-300"
                  }
                >
                  {status === "connected" ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gere faturas automaticamente a partir dos eventos e mantenha
              clientes, servicos e recebimentos sincronizados com o seu ERP
              financeiro.
            </p>

            <div className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-900/30 dark:text-sky-100">
              Conecte sua conta Conta Azul para gerar faturas automaticamente a
              partir dos eventos.
            </div>

            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-muted/40 bg-muted/20 px-3 py-2">
                <dt className="text-muted-foreground">Ultima sincronizacao</dt>
                <dd className="font-medium text-foreground">
                  {lastSyncFormatted ?? "Nunca sincronizado"}
                </dd>
              </div>

              {connectedAtFormatted && (
                <div className="flex items-center justify-between rounded-md border border-muted/40 bg-muted/20 px-3 py-2">
                  <dt className="text-muted-foreground">Conexao estabelecida</dt>
                  <dd className="font-medium text-foreground">
                    {connectedAtFormatted}
                  </dd>
                </div>
              )}

              {organizationName && (
                <div className="flex items-center justify-between rounded-md border border-muted/40 bg-muted/20 px-3 py-2">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Organizacao
                  </dt>
                  <dd className="font-medium text-foreground">
                    {organizationName}
                  </dd>
                </div>
              )}

              {connectedByName && (
                <div className="flex items-center justify-between rounded-md border border-muted/40 bg-muted/20 px-3 py-2">
                  <dt className="text-muted-foreground">Conectado por</dt>
                  <dd className="font-medium text-foreground">
                    {connectedByName}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <PermissionGate
              resource="integrations"
              action="manage"
              fallback={
                <p className="w-full text-xs text-muted-foreground md:w-auto">
                  Voce nao tem permissao para alterar esta integracao.
                </p>
              }
            >
              {status === "connected" ? (
                <ContaAzulDisconnectButton className="w-full md:w-auto" />
              ) : (
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-700 md:w-auto"
                >
                  <Link href={connectUrl}>Conectar Conta Azul</Link>
                </Button>
              )}
            </PermissionGate>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              Os dados sao armazenados com seguranca e voce pode revogar o
              acesso a qualquer momento.
            </div>
          </CardFooter>
        </Card>

        <Card className="flex h-full flex-col items-center justify-center border-dashed text-center text-muted-foreground">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="rounded-2xl bg-muted p-4">
              <Plug2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                Mais integracoes em breve
              </CardTitle>
              <CardDescription className="text-sm">
                Estamos trabalhando para disponibilizar novas conexoes uteis
                para o seu negocio.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

