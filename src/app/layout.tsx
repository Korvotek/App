import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { UserRole } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sigelo",
  description: "Aplicação Sigelo construída com Next.js 15",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: {
    id: string;
    email: string;
    full_name: string | null;
    picture_url: string | null;
    role: UserRole | null;
    tenant_id: string | null;
    active: boolean | null;
    created_at: string | null;
    last_login_at: string | null;
    last_activity_at: string | null;
  } | null = null;
  let initialRole: UserRole | null = null;

  if (user) {
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select(
        `
          id,
          email,
          full_name,
          picture_url,
          role,
          tenant_id,
          active,
          created_at,
          last_login_at,
          last_activity_at
        `,
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!profileError && profileData) {
      initialProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        picture_url: profileData.picture_url,
        role: (profileData.role as UserRole | null) ?? null,
        tenant_id: profileData.tenant_id,
        active: profileData.active,
        created_at: profileData.created_at,
        last_login_at: profileData.last_login_at,
        last_activity_at: profileData.last_activity_at,
      };
      initialRole = initialProfile.role;
    } else if (typeof user.user_metadata?.role === "string") {
      initialRole = user.user_metadata.role as UserRole;
    }
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider
            initialUser={user}
            initialProfile={initialProfile}
            initialRole={initialRole}
            initialLoading={!user}
          >
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
