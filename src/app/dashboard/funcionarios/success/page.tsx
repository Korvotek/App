import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function WorkerRegistrationSuccessPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Funcionário Registrado!</CardTitle>
          <CardDescription>
            O funcionário foi cadastrado com sucesso no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/funcionarios" className="w-full">
              <Button className="w-full">Ver Lista de Funcionários</Button>
            </Link>
            <Link href="/dashboard/funcionarios/cadastrar" className="w-full">
              <Button variant="outline" className="w-full">
                Cadastrar Outro Funcionário
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="ghost" className="w-full">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
