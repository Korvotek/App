"use client";

import { useState } from "react";
import { debugOperationsConnection } from "@/actions/debug-operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugOperationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      userEmail: string | undefined;
      tenantId: string;
      simpleQueryCount: number;
      complexQueryCount: number;
    };
    error?: string;
  } | null>(null);

  const handleDebug = async () => {
    setIsLoading(true);
    try {
      const debugResult = await debugOperationsConnection();
      setResult(debugResult);
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao executar debug",
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Conexão com Operações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleDebug} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Executando debug..." : "Executar Debug"}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Resultado do Debug:
              </h3>
              <div className={`p-4 rounded-lg ${
                result.success 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                <p><strong>Status:</strong> {result.success ? "✅ Sucesso" : "❌ Erro"}</p>
                <p><strong>Mensagem:</strong> {result.message}</p>
                
                {result.data && (
                  <div className="mt-2">
                    <p><strong>Email do usuário:</strong> {result.data.userEmail}</p>
                    <p><strong>Tenant ID:</strong> {result.data.tenantId}</p>
                    <p><strong>Query simples:</strong> {result.data.simpleQueryCount} registros</p>
                    <p><strong>Query complexa:</strong> {result.data.complexQueryCount} registros</p>
                  </div>
                )}
                
                {result.error && (
                  <div className="mt-2">
                    <p><strong>Erro detalhado:</strong></p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

