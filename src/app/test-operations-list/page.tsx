"use client";

import { useState } from "react";
import { useOperations } from "@/hooks/use-operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestOperationsListPage() {
  const [showDetails, setShowDetails] = useState(false);
  
  const { data, isLoading, error, refetch } = useOperations({
    page: 1,
    limit: 5,
  });

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste - Lista de Operações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => refetch()} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Carregando..." : "Recarregar"}
            </Button>
            
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="outline"
            >
              {showDetails ? "Ocultar" : "Mostrar"} Detalhes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Status</h3>
              <p className="text-blue-600">
                {isLoading ? "Carregando..." : error ? "Erro" : "Sucesso"}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Operações</h3>
              <p className="text-green-600">
                {data?.operations.length || 0}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total</h3>
              <p className="text-purple-600">
                {data?.totalCount || 0}
              </p>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              <h3 className="font-semibold">Erro:</h3>
              <p className="mb-2">{error.message}</p>
              {showDetails && (
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {data && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              <h3 className="font-semibold">Dados Recebidos:</h3>
              <p className="mb-2">
                {data.operations.length} operações de {data.totalCount} total
              </p>
              {showDetails && (
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {isLoading && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              <p>Carregando operações...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

