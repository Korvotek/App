"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  funcionarios: "Funcionários",
  cadastrar: "Cadastrar",
  editar: "Editar",
  clientes: "Clientes",
  eventos: "Eventos",
  veiculos: "Veículos",
  operacoes: "Operações",
  produtos: "Produtos",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  integracoes: "Integracoes",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  
  const filteredSegments = pathSegments.filter(segment => segment !== "dashboard");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {filteredSegments.map((segment, index) => {
          const isLast = index === filteredSegments.length - 1;
          const href = "/dashboard/" + filteredSegments.slice(0, index + 1).join("/");
          const label =
            pathLabels[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <div key={segment} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
