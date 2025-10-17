"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  createContaAzulIntegration, 
  getContaAzulIntegration,
  getContaAzulAuthUrl,
  syncContaAzulData,
  disconnectContaAzul
} from "@/actions/contaazul-actions";
import { toast } from "sonner";
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings,
  Link as LinkIcon,
  Unlink
} from "lucide-react";
import type { ContaAzulIntegration } from "@/lib/contaazul/types";

export function ContaAzulIntegrationPage() {
  const [integration, setIntegration] = useState<ContaAzulIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
  });

  useEffect(() => {
    loadIntegration();
  }, []);

  const loadIntegration = async () => {
    try {
      const data = await getContaAzulIntegration();
      setIntegration(data);
      if (data) {
        setFormData({
          clientId: data.client_id,
          clientSecret: data.client_secret,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar integração:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async () => {
    if (!formData.clientId || !formData.clientSecret) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setConfiguring(true);
    try {
      const result = await createContaAzulIntegration(
        formData.clientId,
        formData.clientSecret
      );

      if (result) {
        setIntegration(result);
        toast.success("Integração criada! Agora você pode conectar sua conta.");
      } else {
        toast.error("Erro ao criar integração");
      }
    } catch (error) {
      console.error("Erro ao configurar:", error);
      toast.error("Erro ao configurar integração");
    } finally {
      setConfiguring(false);
    }
  };

  const handleConnect = async () => {
    try {
      const authUrl = await getContaAzulAuthUrl();
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast.error("Erro ao gerar URL de autorização");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast.error("Erro ao conectar com ContaAzul");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncContaAzulData();
      if (result.success) {
        toast.success(result.message);
        await loadIntegration(); // Recarregar dados
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      toast.error("Erro durante a sincronização");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await disconnectContaAzul();
      if (success) {
        setIntegration(null);
        toast.success("Integração desconectada com sucesso");
      } else {
        toast.error("Erro ao desconectar integração");
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast.error("Erro ao desconectar integração");
    }
  };

  const isConnected = integration?.access_token && 
    integration?.expires_at && 
    integration.expires_at > Date.now();

  const isExpired = integration?.expires_at && 
    integration.expires_at <= Date.now();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Carregando configurações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Integração ContaAzul</h1>
          <p className="text-muted-foreground text-sm">
            Conecte sua conta ContaAzul para sincronizar dados automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Conectado
            </Badge>
          ) : isExpired ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Token Expirado
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Não Conectado
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Seu Client ID do ContaAzul"
                disabled={!!integration}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={formData.clientSecret}
                onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
                placeholder="Seu Client Secret do ContaAzul"
                disabled={!!integration}
              />
            </div>

            {!integration && (
              <Button 
                onClick={handleConfigure} 
                disabled={configuring}
                className="w-full"
              >
                {configuring ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  "Configurar Integração"
                )}
              </Button>
            )}

            {integration && !isConnected && (
              <Button 
                onClick={handleConnect}
                className="w-full"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Conectar com ContaAzul
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status e Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Status e Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integration && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Conectado" : "Não Conectado"}
                    </Badge>
                  </div>
                  
                  {integration.last_sync_at && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Última Sincronização:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(integration.last_sync_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}

                  {integration.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Token Expira:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(integration.expires_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {isConnected && (
                    <Button 
                      onClick={handleSync} 
                      disabled={syncing}
                      className="w-full"
                    >
                      {syncing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar Dados
                        </>
                      )}
                    </Button>
                  )}

                  {(isConnected || isExpired) && (
                    <Button 
                      onClick={handleConnect}
                      variant="outline"
                      className="w-full"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Reconectar
                    </Button>
                  )}

                  <Button 
                    onClick={handleDisconnect}
                    variant="destructive"
                    className="w-full"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              </>
            )}

            {!integration && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Configure a integração para começar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre a integração */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-1">Configure</h3>
              <p className="text-sm text-muted-foreground">
                Insira suas credenciais do ContaAzul Developer
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-1">Conecte</h3>
              <p className="text-sm text-muted-foreground">
                Autorize o acesso à sua conta ContaAzul
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-1">Sincronize</h3>
              <p className="text-sm text-muted-foreground">
                Importe clientes, produtos e vendas automaticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
