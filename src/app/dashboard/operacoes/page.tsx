import { OperationsList } from "@/components/operations-list";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function OperationsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "events", action: "read" }}>
      <OperationsList />
    </ProtectedRoute>
  );
}
