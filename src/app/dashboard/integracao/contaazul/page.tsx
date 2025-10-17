import { ContaAzulIntegrationPage } from "@/components/contaazul-integration-page";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ContaAzulPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <ContaAzulIntegrationPage />
    </ProtectedRoute>
  );
}
