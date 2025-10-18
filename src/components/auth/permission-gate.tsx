"use client";

import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/auth/permissions";

interface PermissionGateProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}

interface RoleGateProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  resource,
  action,
  fallback = null,
}: PermissionGateProps) {
  const { role, loading, checkPermission } = useAuth();

  if (loading && !role) {
    return <>{fallback}</>;
  }

  const allowed = checkPermission(resource, action);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RoleGate({
  children,
  requiredRole,
  fallback = null,
}: RoleGateProps) {
  const { role, loading, requireRole } = useAuth();

  if ((loading && !role) || !role) {
    return <>{fallback}</>;
  }

  if (!requireRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
