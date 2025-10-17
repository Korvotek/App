import { VehicleRegistrationForm } from "@/components/vehicle-registration-form";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function VehicleRegistrationPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "vehicles", action: "create" }}>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastro de Veículo</h1>
          <p className="text-muted-foreground mt-2">
            Registre um novo veículo no sistema Sigelo
          </p>
        </div>

        <VehicleRegistrationForm />
      </div>
    </ProtectedRoute>
  );
}
