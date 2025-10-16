"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { UserRole, hasPermission } from "@/lib/auth/permissions";
import type { User } from "@supabase/supabase-js";

interface UserWithRole {
  user: User;
  role: UserRole | null;
  userData: {
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
  } | null;
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select(`
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
          `)
          .eq("id", user.id)
          .single();

        if (userDataError) {
          console.error("Error fetching user role:", userDataError);
          setUser(null);
        } else {
          setUser({
            user,
            role: userData?.role as UserRole | null,
            userData: userData,
          });
        }
      } catch (error) {
        console.error("Error in useAuth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
        } else if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select(`
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
            `)
            .eq("id", session.user.id)
            .single();

          setUser({
            user: session.user,
            role: userData?.role as UserRole | null,
            userData: userData,
          });
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const checkPermission = (resource: string, action: string): boolean => {
    return hasPermission(user?.role || null, resource, action);
  };

  const requirePermission = (resource: string, action: string): boolean => {
    const hasAccess = checkPermission(resource, action);
    if (!hasAccess) {
      router.push("/dashboard?error=unauthorized");
    }
    return hasAccess;
  };

  const requireRole = (requiredRole: UserRole): boolean => {
    if (!user?.role) {
      router.push("/login");
      return false;
    }

    const roleHierarchy: Record<UserRole, number> = {
      ADMIN: 3,
      OPERATOR: 2,
      VIEWER: 1,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      router.push("/dashboard?error=insufficient_permissions");
      return false;
    }

    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return {
    user: user?.user || null,
    userData: user?.userData || null,
    role: user?.role || null,
    loading,
    checkPermission,
    requirePermission,
    requireRole,
    signOut,
    isAuthenticated: !!user?.user,
  };
}