import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function VehicleSuccessPage() {
  return (
    <div className="w-full space-y-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Veículo Cadastrado!</CardTitle>
          <CardDescription>
            O veículo foi registrado com sucesso no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/dashboard/veiculos">
            <Button className="w-full">Voltar para Veículos</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
