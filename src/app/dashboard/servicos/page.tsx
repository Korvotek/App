import { ProtectedRoute } from "@/components/auth/protected-route";
import { ServicesList } from "@/components/services-list";

export default function ServicosPage() {
  return (
    <ProtectedRoute
      requiredPermission={{ resource: "services", action: "read" }}
    >
      <ServicesList />
    </ProtectedRoute>
  );
}

