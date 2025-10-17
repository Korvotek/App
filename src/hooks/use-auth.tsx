"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserRole, hasPermission } from "@/lib/auth/permissions";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
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
};

interface AuthState {
  user: User | null;
  userData: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextValue {
  user: User | null;
  userData: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  checkPermission: (resource: string, action: string) => boolean;
  requirePermission: (resource: string, action: string) => boolean;
  requireRole: (requiredRole: UserRole) => boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  try {
    const { data: userData, error } = await supabase
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

    if (error) {
      return null;
    }

    if (userData) {
      return userData as UserProfile;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  return null;
}

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: User | null;
  initialProfile?: UserProfile | null;
  initialRole?: UserRole | null;
  initialLoading?: boolean;
};

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
  initialRole = null,
  initialLoading = false,
}: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(() => {
    const derivedRole =
      initialProfile?.role ??
      initialRole ??
      ((initialUser?.user_metadata?.role as UserRole | undefined) ?? null);

    return {
      user: initialUser,
      userData: initialProfile,
      role: derivedRole ?? null,
      loading: initialLoading ?? !initialUser,
    };
  });

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setState((prev) => ({
        ...prev,
        loading: prev.loading || !prev.user,
      }));

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !user) {
          setState({
            user: null,
            userData: null,
            role: null,
            loading: false,
          });
          return;
        }

        const profile = await fetchUserProfile(user);

        if (!isMounted) return;

        setState((prev) => {
          const nextProfile = profile ?? prev.userData;
          const metadataRole = user.user_metadata?.role as
            | UserRole
            | undefined;
          const nextRole =
            profile?.role ?? prev.role ?? (metadataRole ?? null);

          return {
            user,
            userData: nextProfile,
            role: nextRole,
            loading: false,
          };
        });
      } catch (err) {
        console.error("Error during authentication:", err);
        if (!isMounted) return;
        setState({
          user: null,
          userData: null,
          role: null,
          loading: false,
        });
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setState({
          user: null,
          userData: null,
          role: null,
          loading: false,
        });
        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setState((prev) => ({ ...prev, loading: true }));
      }

      try {
        const { data: userResult, error: getUserError } =
          await supabase.auth.getUser();
        const verifiedUser = userResult.user;

        if (!isMounted) return;

        if (getUserError || !verifiedUser) {
          setState({
            user: null,
            userData: null,
            role: null,
            loading: false,
          });
          return;
        }

        const profile = await fetchUserProfile(verifiedUser);
        if (!isMounted) return;

        setState((prev) => {
          const nextProfile = profile ?? prev.userData;
          const metadataRole = verifiedUser.user_metadata?.role as
            | UserRole
            | undefined;
          const nextRole =
            profile?.role ?? prev.role ?? (metadataRole ?? null);

          return {
            user: verifiedUser,
            userData: nextProfile,
            role: nextRole,
            loading: false,
          };
        });
      } catch (err) {
        console.error("Error during auth state change:", err);
        if (!isMounted) return;
        setState({
          user: null,
          userData: null,
          role: null,
          loading: false,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const checkPermission = (resource: string, action: string) =>
      hasPermission(state.role, resource, action);

    const requirePermission = (resource: string, action: string) => {
      const allowed = checkPermission(resource, action);
      if (!allowed) {
        router.push("/dashboard?error=unauthorized");
      }
      return allowed;
    };

    const requireRole = (requiredRole: UserRole) => {
      if (!state.role) {
        router.push("/login");
        return false;
      }

      const roleHierarchy: Record<UserRole, number> = {
        ADMIN: 3,
        OPERATOR: 2,
        VIEWER: 1,
      };

      if (roleHierarchy[state.role] < roleHierarchy[requiredRole]) {
        router.push("/dashboard?error=insufficient_permissions");
        return false;
      }

      return true;
    };

    const signOut = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }

      try {
        const response = await fetch("/auth/signout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const { message } = await response.json();
          console.error("Failed to clear server session:", message);
        }
      } catch (error) {
        console.error("Error calling signout route:", error);
      } finally {
        setState({
          user: null,
          userData: null,
          role: null,
          loading: false,
        });
        router.push("/login");
        router.refresh();
      }
    };

    return {
      user: state.user,
      userData: state.userData,
      role: state.role,
      loading: state.loading,
      checkPermission,
      requirePermission,
      requireRole,
      signOut,
      isAuthenticated: !!state.user,
    };
  }, [state, router]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
