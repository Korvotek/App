"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Car,
  Settings,
  FileText,
  Package,
  BarChart3,
  UserPlus,
  Building2,
} from "lucide-react";

const navigationItems = [
  {
    title: "Visão Geral",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        title: "Eventos",
        href: "/dashboard/eventos",
        icon: Calendar,
      },
      {
        title: "Clientes",
        href: "/dashboard/clientes",
        icon: Users,
      },
      {
        title: "Funcionários",
        href: "/dashboard/funcionarios",
        icon: UserPlus,
      },
      {
        title: "Veículos",
        href: "/dashboard/veiculos",
        icon: Car,
      },
    ],
  },
  {
    title: "Operações",
    items: [
      {
        title: "Operações",
        href: "/dashboard/operacoes",
        icon: Settings,
      },
      {
        title: "Produtos/Serviços",
        href: "/dashboard/produtos",
        icon: Package,
      },
    ],
  },
  {
    title: "Relatórios",
    items: [
      {
        title: "Relatórios",
        href: "/dashboard/relatorios",
        icon: FileText,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Sigelo</h1>
        </div>

        <nav className="space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
