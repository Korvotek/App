"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOperations } from "@/actions/operations-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugReactQueryPage() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog("Componente montado");
  }, []);

  const query = useQuery({
    queryKey: ["debug-operations"],
    queryFn: async () => {
      addLog("🔍 Iniciando queryFn...");
      try {
        addLog("📞 Chamando getOperations...");
        const result = await getOperations({ page: 1, limit: 3 });
        addLog(`✅ getOperations retornou: ${result.operations.length} operações`);
        return result;
      } catch (error) {
        addLog(`❌ Erro em getOperations: ${error instanceof Error ? error.message : String(error)}`);
        addLog(`❌ Tipo do erro: ${typeof error}`);
        addLog(`❌ Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
        throw error;
      }
    },
    retry: false, // Desabilitar retry para debug mais rápido
    staleTime: 0, // Sempre buscar dados frescos
  });

  useEffect(() => {
    if (query.isLoading) addLog("🔄 Query carregando...");
    if (query.isError) addLog(`❌ Query com erro: ${query.error?.message || 'Erro desconhecido'}`);
    if (query.isSuccess) addLog(`✅ Query bem-sucedida: ${query.data?.operations.length || 0} operações`);
  }, [query.status, query.error, query.data]);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug React Query - Operações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => query.refetch()} 
              disabled={query.isLoading}
              variant="outline"
            >
              {query.isLoading ? "Carregando..." : "Executar Query"}
            </Button>
            
            <Button 
              onClick={() => setLogs([])} 
              variant="outline"
            >
              Limpar Logs
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${query.isLoading ? 'bg-yellow-100 text-yellow-800' : query.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              <h3 className="font-semibold">Status</h3>
              <p>{query.isLoading ? "Carregando" : query.isError ? "Erro" : "Sucesso"}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Operações</h3>
              <p className="text-blue-600">{query.data?.operations.length || 0}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total</h3>
              <p className="text-purple-600">{query.data?.totalCount || 0}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800">Tentativas</h3>
              <p className="text-gray-600">{query.failureCount || 0}</p>
            </div>
          </div>
          
          {query.error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              <h3 className="font-semibold">Erro Detalhado:</h3>
              <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(query.error, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Logs de Debug:</h3>
            <div className="bg-white p-2 rounded max-h-64 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
