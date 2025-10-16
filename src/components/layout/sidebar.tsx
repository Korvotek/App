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
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { auth } from "@/lib/auth/google-auth";
import { toast } from "sonner";

interface SidebarProps {
  session: Session;
}

const menuItems = [
  { icon: UserCog, label: "Funcionários", href: "/dashboard/funcionarios" },
  { icon: Car, label: "Veículos", href: "/dashboard/veiculos" },
];

export function Sidebar({ session }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    const { error } = await auth.signOut();
    if (error) {
      toast.error("Erro ao fazer logout");
    } else {
      toast.success("Logout realizado com sucesso!");
      window.location.href = "/";
    }
  };

  const userInitials =
    session.user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || session.user.email?.slice(0, 2).toUpperCase();

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
              <AvatarImage src={session.user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-teal-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user.email}
                </p>
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
                <Link
                  key={item.href}
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
