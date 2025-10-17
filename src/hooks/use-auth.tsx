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

const initialState: AuthState = {
  user: null,
  userData: null,
  role: null,
  loading: true,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CLIENT_LOG_PREFIX = "[use-auth]";

function clientLog(
  level: "log" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>,
) {
  const logger = console[level];
  if (meta) {
    logger?.(`${CLIENT_LOG_PREFIX} ${message}`, meta);
  } else {
    logger?.(`${CLIENT_LOG_PREFIX} ${message}`);
  }
}

const logClientInfo = (
  message: string,
  meta?: Record<string, unknown>,
) => clientLog("log", message, meta);

const logClientWarn = (
  message: string,
  meta?: Record<string, unknown>,
) => clientLog("warn", message, meta);

const logClientError = (
  message: string,
  meta?: Record<string, unknown>,
) => clientLog("error", message, meta);

async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  logClientInfo("Fetching profile for user", { userId: user.id });

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

    logClientInfo("Fetch profile query result", {
      found: !!userData,
      role: userData?.role,
      error: error?.message,
    });

    if (error) {
      logClientWarn("Error querying user profile", {
        userId: user.id,
        error: error.message,
      });
      return null;
    }

    if (userData) {
      logClientInfo("User profile found", {
        userId: user.id,
        role: userData.role,
      });
      return userData as UserProfile;
    }

    logClientWarn(
      "User not found in database, expected callback to provision",
      { userId: user.id },
    );
  } catch (error) {
    logClientError("Unexpected error fetching profile", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
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
      logClientInfo("Starting authentication check");
      setState((prev) => ({
        ...prev,
        loading: prev.loading || !prev.user,
      }));

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        logClientInfo("getUser result", {
          hasUser: !!user,
          userId: user?.id,
          error: error?.message,
        });

        if (!isMounted) return;

        if (error || !user) {
          logClientWarn("No authenticated user found after getUser", {
            error: error?.message,
          });
          setState({
            user: null,
            userData: null,
            role: null,
            loading: false,
          });
          return;
        }

        logClientInfo("Authenticated user found, fetching profile", {
          userId: user.id,
        });
        const profile = await fetchUserProfile(user);
        logClientInfo("Profile fetch completed", {
          hasProfile: !!profile,
          role: profile?.role,
        });

        if (!isMounted) return;

        setState((prev) => {
          const nextProfile = profile ?? prev.userData;
          const metadataRole = user.user_metadata?.role as
            | UserRole
            | undefined;
          const nextRole =
            profile?.role ?? prev.role ?? (metadataRole ?? null);

          logClientInfo("Updating auth state", {
            hasProfile: !!profile,
            profileRole: profile?.role,
            metadataRole,
            nextRole,
            userId: user.id,
          });

          return {
            user,
            userData: nextProfile,
            role: nextRole,
            loading: false,
          };
        });
      } catch (err) {
        logClientError("Unhandled error during loadUser", {
          error: err instanceof Error ? err.message : String(err),
        });
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
      logClientInfo("Auth state change event received", {
        event,
        hasSessionUser: !!session?.user,
      });

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
          logClientWarn("Auth state change but getUser returned no user", {
            event,
            error: getUserError?.message,
          });
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
        logClientError("Unhandled error during auth state change getUser", {
          event,
          error: err instanceof Error ? err.message : String(err),
        });
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
        logClientError("Error signing out on client", {
          error: error instanceof Error ? error.message : String(error),
        });
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
          logClientError("Failed to clear server session", { message });
        }
      } catch (error) {
        logClientError("Error calling server signout route", {
          error: error instanceof Error ? error.message : String(error),
        });
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
