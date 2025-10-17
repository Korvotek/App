import { CustomersList } from "@/components/customers-list";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ClientesPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "customers", action: "read" }}>
      <CustomersList />
    </ProtectedRoute>
  );
}
