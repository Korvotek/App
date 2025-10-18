"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, canAccessRoute } from "@/lib/auth/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, role, loading, checkPermission, requireRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!canAccessRoute(role, pathname)) {
      router.push("/dashboard?error=unauthorized");
      return;
    }

    if (requiredRole && !requireRole(requiredRole)) {
      return;
    }

    if (requiredPermission && !checkPermission(requiredPermission.resource, requiredPermission.action)) {
      router.push("/dashboard?error=insufficient_permissions");
      return;
    }
  }, [user, role, loading, pathname, requiredRole, requiredPermission, checkPermission, requireRole, router]);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!canAccessRoute(role, pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole && !requireRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Permissão Insuficiente</CardTitle>
            <CardDescription>
              Seu nível de acesso não permite realizar esta ação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

