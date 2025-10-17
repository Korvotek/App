"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/providers/theme-provider";
import { useSidebar } from "@/providers/sidebar-provider";
import {
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Car,
  Users,
  Activity,
  Plug,
  UserCheck,
  Briefcase,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/permission-gate";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  user: User;
}

const menuItems = [
  {
    icon: UserCog,
    label: "Funcionários",
    href: "/dashboard/funcionarios",
    permission: { resource: "employees", action: "read" },
  },
  {
    icon: Car,
    label: "Veículos",
    href: "/dashboard/veiculos",
    permission: { resource: "vehicles", action: "read" },
  },
  {
    icon: UserCheck,
    label: "Clientes",
    href: "/dashboard/clientes",
    permission: { resource: "customers", action: "read" },
  },
  {
    icon: Briefcase,
    label: "Servi��os",
    href: "/dashboard/servicos",
    permission: { resource: "services", action: "read" },
  },
  {
    icon: Users,
    label: "Usuários",
    href: "/dashboard/usuarios",
    permission: { resource: "users", action: "read" },
  },
  {
    icon: Activity,
    label: "Auditoria",
    href: "/dashboard/auditoria",
    permission: { resource: "audit", action: "read" },
  },
  {
    icon: Plug,
    label: "Integracoes",
    href: "/dashboard/integracoes",
    permission: { resource: "integrations", action: "read" },
  },
];

export function Sidebar({ user }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { userData, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const derivedName =
    userData?.full_name ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null);

  const derivedEmail = userData?.email || user.email || "";

  const fallbackInitialsSource = derivedName || derivedEmail;
  const userInitials = fallbackInitialsSource
    ? fallbackInitialsSource
        .split(" ")
        .filter(Boolean)
        .map((segment) => segment[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-[#1e2738] border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out z-50
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              Sigelo
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  userData?.picture_url ||
                  (typeof user.user_metadata?.avatar_url === "string"
                    ? user.user_metadata.avatar_url
                    : typeof user.user_metadata?.picture === "string"
                      ? user.user_metadata.picture
                      : undefined)
                }
              />
              <AvatarFallback className="bg-teal-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {derivedName || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {derivedEmail}
                </p>
                {role && (
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 truncate">
                    {role}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <PermissionGate
                  key={item.href}
                  resource={item.permission.resource}
                  action={item.permission.action}
                >
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </PermissionGate>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <div className="px-3 py-2 space-y-1">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`
              w-full justify-start gap-3 text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={
              collapsed ? (theme === "dark" ? "Claro" : "Escuro") : undefined
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="text-sm font-medium">
                {theme === "dark" ? "Claro" : "Escuro"}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={`
              w-full justify-start gap-3 text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
