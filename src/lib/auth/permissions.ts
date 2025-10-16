export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    { resource: "users", actions: ["read", "create", "update", "delete"] },
    { resource: "audit", actions: ["read"] },
    { resource: "employees", actions: ["read", "create", "update", "delete"] },
    { resource: "vehicles", actions: ["read", "create", "update", "delete"] },
    { resource: "dashboard", actions: ["read"] },
  ],
  OPERATOR: [
    { resource: "employees", actions: ["read", "create", "update", "delete"] },
    { resource: "vehicles", actions: ["read", "create", "update", "delete"] },
    { resource: "dashboard", actions: ["read"] },
  ],
  VIEWER: [
    { resource: "employees", actions: ["read"] },
    { resource: "vehicles", actions: ["read"] },
    { resource: "dashboard", actions: ["read"] },
  ],
};

export function hasPermission(
  userRole: UserRole | null,
  resource: string,
  action: string
): boolean {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  const resourcePermission = permissions.find(p => p.resource === resource);
  
  return resourcePermission?.actions.includes(action) ?? false;
}

export function canAccessRoute(userRole: UserRole | null, route: string): boolean {
  const routePermissions: Record<string, { role: UserRole; action: string }> = {
    "/dashboard/usuarios": { role: "ADMIN", action: "read" },
    "/dashboard/auditoria": { role: "ADMIN", action: "read" },
    "/dashboard/funcionarios": { role: "OPERATOR", action: "read" },
    "/dashboard/veiculos": { role: "OPERATOR", action: "read" },
    "/dashboard": { role: "VIEWER", action: "read" },
  };

  const permission = routePermissions[route];
  if (!permission) return true; // Rotas não listadas são públicas

  return hasPermission(userRole, permission.role.toLowerCase(), permission.action);
}
