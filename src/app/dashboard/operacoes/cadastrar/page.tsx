import { OperationRegistrationForm } from "@/components/operation-registration-form";
import { DashboardHeader } from "@/components/dashboard-header";

export default function CreateOperationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Cadastrar Operação"
        description="Crie uma nova operação para um evento"
      />
      
      <OperationRegistrationForm />
    </div>
  );
}

