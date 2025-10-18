"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, User, Clock } from "lucide-react";
import { toast } from "sonner";

interface ConcurrencyWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export function ConcurrencyWarning({ 
  isOpen, 
  onClose, 
  onReload, 
  lastModifiedBy, 
  lastModifiedAt 
}: ConcurrencyWarningProps) {
  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-orange-600">Conflito de Edição</CardTitle>
          </div>
          <CardDescription>
            Este evento foi modificado por outro usuário enquanto você estava editando.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastModifiedBy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Modificado por: <strong>{lastModifiedBy}</strong></span>
            </div>
          )}
          
          {lastModifiedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Em: <strong>{formatDateTime(lastModifiedAt)}</strong></span>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-sm text-orange-800">
              Suas alterações não salvas serão perdidas. Recomendamos recarregar a página 
              para ver as alterações mais recentes antes de continuar editando.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onReload} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline"
              className="flex-1"
            >
              Continuar Editando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para controle de concorrência
export function useConcurrencyControl(eventId: string, currentData: any) {
  const [showWarning, setShowWarning] = useState(false);
  const [lastModifiedBy, setLastModifiedBy] = useState<string>();
  const [lastModifiedAt, setLastModifiedAt] = useState<string>();

  const checkForUpdates = async () => {
    try {
      // TODO: Implementar verificação de atualizações em tempo real
      // Por enquanto, simular verificação
      const response = await fetch(`/api/events/${eventId}/check-updates`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastModifiedAt !== currentData.updated_at) {
          setLastModifiedBy(data.lastModifiedBy);
          setLastModifiedAt(data.lastModifiedAt);
          setShowWarning(true);
          return true;
        }
      }
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
    }
    return false;
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    toast.warning("Continuando com dados desatualizados. Recomendamos recarregar a página.");
  };

  // Verificar atualizações periodicamente
  useEffect(() => {
    if (!eventId || !currentData) return;

    const interval = setInterval(checkForUpdates, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [eventId, currentData]);

  return {
    showWarning,
    lastModifiedBy,
    lastModifiedAt,
    checkForUpdates,
    handleReload,
    handleCloseWarning,
    ConcurrencyWarning: () => (
      <ConcurrencyWarning
        isOpen={showWarning}
        onClose={handleCloseWarning}
        onReload={handleReload}
        lastModifiedBy={lastModifiedBy}
        lastModifiedAt={lastModifiedAt}
      />
    ),
  };
}
