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
  
  const hasAccess = resourcePermission?.actions.includes(action) ?? false;
  console.log(`Permission check: role=${userRole}, resource=${resource}, action=${action}, hasAccess=${hasAccess}`);
  
  return hasAccess;
}

export function canAccessRoute(userRole: UserRole | null, route: string): boolean {
  const routePermissions: Record<string, { resource: string; action: string }> = {
    "/dashboard/usuarios": { resource: "users", action: "read" },
    "/dashboard/auditoria": { resource: "audit", action: "read" },
    "/dashboard/funcionarios": { resource: "employees", action: "read" },
    "/dashboard/veiculos": { resource: "vehicles", action: "read" },
    "/dashboard": { resource: "dashboard", action: "read" },
  };

  const permission = routePermissions[route];
  if (!permission) return true; // Rotas não listadas são públicas

  return hasPermission(userRole, permission.resource, permission.action);
}
