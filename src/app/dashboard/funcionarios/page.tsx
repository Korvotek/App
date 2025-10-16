import { WorkersList } from "@/components/workers-list";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function WorkersPage() {
  return (
    <ProtectedRoute requiredRole="OPERATOR">
      <WorkersList />
    </ProtectedRoute>
  );
}
