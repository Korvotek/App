import { WorkerRegistrationForm } from "@/components/worker-registration-form";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function WorkerRegistrationPage() {
  return (
    <ProtectedRoute requiredRole="OPERATOR">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastro de Funcionário</h1>
          <p className="text-muted-foreground mt-2">
            Registre um novo funcionário no sistema Sigelo
          </p>
        </div>

        <WorkerRegistrationForm />
      </div>
    </ProtectedRoute>
  );
}
