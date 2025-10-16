import { VehicleRegistrationForm } from "@/components/vehicle-registration-form";

export default function VehicleRegistrationPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cadastro de Veículo</h1>
        <p className="text-muted-foreground mt-2">
          Registre um novo veículo no sistema Sigelo
        </p>
      </div>

      <VehicleRegistrationForm />
    </div>
  );
}
