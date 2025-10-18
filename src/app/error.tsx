"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold">500</h1>
        <h2 className="text-2xl font-semibold">Erro interno do servidor</h2>
        <p className="text-muted-foreground mt-2">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Detalhes do erro
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Tentar novamente
        </Button>
        <Link href="/dashboard">
          <Button>Voltar ao Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

