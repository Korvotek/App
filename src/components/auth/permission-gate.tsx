"use client";

import { useAuth } from "@/hooks/use-auth";
import { UserRole, hasPermission } from "@/lib/auth/permissions";

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
  fallback = null 
}: PermissionGateProps) {
  const { role } = useAuth();
  
  if (!hasPermission(role, resource, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function RoleGate({ 
  children, 
  requiredRole, 
  fallback = null 
}: RoleGateProps) {
  const { role } = useAuth();
  
  if (!role) {
    return <>{fallback}</>;
  }

  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    OPERATOR: 2,
    VIEWER: 1,
  };

  const userLevel = roleHierarchy[role];
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
