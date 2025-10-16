import { VehiclesList } from "@/components/vehicles-list";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function VehiclesPage() {
  return (
    <ProtectedRoute requiredRole="OPERATOR">
      <VehiclesList />
    </ProtectedRoute>
  );
}
