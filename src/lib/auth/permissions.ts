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
    { resource: "customers", actions: ["read", "create", "update", "delete", "sync"] },
    { resource: "services", actions: ["read", "create", "update", "delete", "sync"] },
    { resource: "events", actions: ["read", "create", "update", "delete"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "integrations", actions: ["read", "manage"] },
  ],
  OPERATOR: [
    { resource: "employees", actions: ["read", "create", "update", "delete"] },
    { resource: "vehicles", actions: ["read", "create", "update", "delete"] },
    { resource: "customers", actions: ["read", "create", "update", "delete", "sync"] },
    { resource: "services", actions: ["read", "update", "sync"] },
    { resource: "events", actions: ["read", "create", "update", "delete"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "integrations", actions: ["read"] },
  ],
  VIEWER: [
    { resource: "employees", actions: ["read"] },
    { resource: "vehicles", actions: ["read"] },
    { resource: "customers", actions: ["read"] },
    { resource: "services", actions: ["read"] },
    { resource: "events", actions: ["read"] },
    { resource: "dashboard", actions: ["read"] },
  ],
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

export function hasPermission(
  userRole: UserRole | null,
  resource: string,
  action: string,
): boolean {
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  const resourcePermission = permissions.find(
    (permission) => permission.resource === resource,
  );

  return resourcePermission?.actions.includes(action) ?? false;
}

export function hasRole(
  userRole: UserRole | null,
  requiredRole: UserRole,
): boolean {
  if (!userRole) return false;

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessRoute(
  userRole: UserRole | null,
  route: string,
): boolean {
  const routePermissions: Record<string, { resource: string; action: string }> =
    {
      "/dashboard/usuarios": { resource: "users", action: "read" },
      "/dashboard/auditoria": { resource: "audit", action: "read" },
      "/dashboard/clientes": { resource: "customers", action: "read" },
      "/dashboard/servicos": { resource: "services", action: "read" },
      "/dashboard/funcionarios": { resource: "employees", action: "read" },
      "/dashboard/veiculos": { resource: "vehicles", action: "read" },
      "/dashboard/eventos": { resource: "events", action: "read" },
      "/dashboard/operacoes": { resource: "events", action: "read" },
      "/dashboard": { resource: "dashboard", action: "read" },
      "/dashboard/integracoes": { resource: "integrations", action: "read" },
    };

  const permission = routePermissions[route];
  if (!permission) {
    return true;
  }

  const hasAccess = hasPermission(
    userRole,
    permission.resource,
    permission.action,
  );

  return hasAccess;
}
