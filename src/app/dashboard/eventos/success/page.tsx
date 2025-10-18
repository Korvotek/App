import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function EventSuccessPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Evento Criado!</CardTitle>
          <CardDescription>
            O evento foi cadastrado com sucesso no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Você pode agora visualizar o evento na lista ou criar um novo evento.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard/eventos">
                Ver Lista de Eventos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/eventos/cadastrar">
                Criar Novo Evento
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}