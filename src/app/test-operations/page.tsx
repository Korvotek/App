"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestOperationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectCall = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testando chamada direta para getOperations...");
      
      // Importar dinamicamente para evitar problemas de SSR
      const { getOperations } = await import("@/actions/operations-actions");
      
      const operations = await getOperations({ page: 1, limit: 5 });
      
      console.log("✅ Chamada direta bem-sucedida:", operations);
      
      setResult({
        success: true,
        data: operations,
        message: "Chamada direta funcionou!"
      });
      
    } catch (err) {
      console.error("❌ Erro na chamada direta:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchCall = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testando chamada via fetch...");
      
      const response = await fetch("/api/test-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: 1, limit: 5 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log("✅ Chamada via fetch bem-sucedida:", data);
      
      setResult({
        success: true,
        data: data,
        message: "Chamada via fetch funcionou!"
      });
      
    } catch (err) {
      console.error("❌ Erro na chamada via fetch:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Carregamento de Operações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testDirectCall} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Testando..." : "Teste Direto"}
            </Button>
            
            <Button 
              onClick={testFetchCall} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Testando..." : "Teste via Fetch"}
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              <h3 className="font-semibold">Erro:</h3>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              <h3 className="font-semibold">Resultado:</h3>
              <p>{result.message}</p>
              <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
