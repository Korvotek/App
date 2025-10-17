"use client";

import { Sidebar } from "./sidebar";
import { useSidebar } from "@/providers/sidebar-provider";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import type { User } from "@supabase/supabase-js";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const { collapsed } = useSidebar();

  return (
    <>
      <Sidebar user={user} />
      <div
        className={`
          transition-all duration-300 min-h-screen
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        <div className="px-8 py-3 border-b border-border bg-muted/30">
          <DashboardBreadcrumb />
        </div>

        <main className="p-8">{children}</main>
      </div>
    </>
  );
}
