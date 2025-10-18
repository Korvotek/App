import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OperationSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Operação Criada com Sucesso!
        </h1>
        <p className="text-gray-600 mt-2">
          A operação foi cadastrada e está disponível na lista de operações.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link href="/dashboard/operacoes">
          <Button>Ver Operações</Button>
        </Link>
        <Link href="/dashboard/operacoes/cadastrar">
          <Button variant="outline">Criar Outra Operação</Button>
        </Link>
      </div>
    </div>
  );
}

