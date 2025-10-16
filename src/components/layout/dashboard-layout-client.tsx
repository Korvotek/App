"use client";

import { Sidebar } from "./sidebar";
import { useSidebar } from "@/providers/sidebar-provider";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import type { Session } from "@supabase/supabase-js";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardLayoutClient({
  children,
  session,
}: DashboardLayoutClientProps) {
  const { collapsed } = useSidebar();

  return (
    <>
      <Sidebar session={session} />
      <div
        className={`
          transition-all duration-300 min-h-screen
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        {/* Breadcrumb */}
        <div className="px-8 py-3 border-b border-border bg-muted/30">
          <DashboardBreadcrumb />
        </div>

        <main className="p-8">{children}</main>
      </div>
    </>
  );
}
