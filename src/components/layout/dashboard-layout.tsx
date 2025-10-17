"use client";

import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0e1a]">
      <Sidebar user={user} />
      <main className="transition-all duration-300 ml-64 peer-[.collapsed]:ml-20">
        {children}
      </main>
    </div>
  );
}
