"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ContaAzulDisconnectButtonProps {
  className?: string;
}

export function ContaAzulDisconnectButton({
  className,
}: ContaAzulDisconnectButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/integrations/conta-azul/disconnect",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error ||
          "Nao foi possivel desconectar da Conta Azul. Tente novamente.";
        setError(message);
      } else {
        router.refresh();
      }
    } catch {
      setError(
        "Erro inesperado ao desconectar. Verifique sua conexao e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full md:w-auto"
        disabled={isLoading}
        onClick={handleDisconnect}
      >
        {isLoading ? "Desconectando..." : "Desconectar Conta Azul"}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive/80">{error}</p>
      )}
    </div>
  );
}

