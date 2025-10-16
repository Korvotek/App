"use client";

import { Sidebar } from "./sidebar";
import type { Session } from "@supabase/supabase-js";

interface DashboardLayoutProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0e1a]">
      <Sidebar session={session} />
      <main className="transition-all duration-300 ml-64 peer-[.collapsed]:ml-20">
        {children}
      </main>
    </div>
  );
}
