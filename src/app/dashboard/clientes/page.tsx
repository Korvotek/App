import { Suspense } from "react";
import { CustomersList } from "@/components/customers-list";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import { DashboardHeader } from "@/components/dashboard-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ClientesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Clientes"
        description="Gerencie os clientes do sistema e sincronize com integrações externas."
      />

      <DashboardBreadcrumb />

      <PermissionGate
        resource="customers"
        action="read"
        fallback={
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Você não tem permissão para visualizar clientes.
            </p>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lista de Clientes</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os clientes cadastrados no sistema.
            </p>
          </div>
          
          <PermissionGate resource="customers" action="create">
            <Button asChild>
              <Link href="/dashboard/clientes/cadastrar">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Link>
            </Button>
          </PermissionGate>
        </div>

        <Suspense fallback={<div>Carregando clientes...</div>}>
          <CustomersList />
        </Suspense>
      </PermissionGate>
    </div>
  );
}
