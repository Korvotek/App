"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  vehicleRegistrationSchema,
  type VehicleRegistrationData,
} from "@/lib/validations/vehicle-schema";
import { registerVehicle } from "@/actions/vehicle-actions";
import { toast } from "sonner";
import { useLicensePlateMask } from "@/hooks/use-license-plate-mask";

export function VehicleRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { plateValue, handlePlateChange, getPlateNumbers, setPlateValue } = useLicensePlateMask();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehicleRegistrationData>({
    resolver: zodResolver(vehicleRegistrationSchema),
    defaultValues: {
      brand: "",
      model: "",
      license_plate: "",
      year: new Date().getFullYear(),
      vehicle_type: undefined,
      fuel_type: undefined,
      module_capacity: undefined,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: VehicleRegistrationData) => {
    setIsSubmitting(true);
    try {
      const result = await registerVehicle(data);
      toast.success(result.message);
      router.push("/dashboard/veiculos?success=true");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao cadastrar veículo.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const fillTestData = () => {
    console.log("🧪 Preenchendo dados de teste...");
    
    // Campos básicos obrigatórios
    setValue("brand", "Ford");
    setValue("model", "Cargo 2428");
    setValue("year", 2020);
    
    // Campo de placa (com máscara)
    setPlateValue("ABC-1234");
    setValue("license_plate", "ABC1234");
    
    // Campos opcionais
    setValue("vehicle_type", "CARGA");
    setValue("fuel_type", "DIESEL"); // Usar valor válido do dropdown
    setValue("module_capacity", 15000);
    
    // Força a atualização do formulário
    setTimeout(() => {
      const currentValues = watch();
      console.log("✅ Dados preenchidos:", currentValues);
      console.log("✅ Placa visual:", plateValue);
    }, 200);
  };

  return (
    <Card className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillTestData}
                className="text-xs"
              >
                🧪 Preencher Dados de Teste
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  {...register("brand")}
                  placeholder="Ex: Ford, Chevrolet, Mercedes"
                />
                {errors.brand && (
                  <p className="text-sm text-red-600">{errors.brand.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder="Ex: Cargo 2428, Sprinter"
                />
                {errors.model && (
                  <p className="text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_plate">Placa *</Label>
                <Input
                  id="license_plate"
                  value={plateValue}
                  onChange={(e) => {
                    handlePlateChange(e);
                    setValue("license_plate", getPlateNumbers());
                  }}
                  placeholder="ABC1234 ou ABC1D23"
                  maxLength={8}
                />
                {errors.license_plate && (
                  <p className="text-sm text-red-600">
                    {errors.license_plate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                  placeholder="2023"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && (
                  <p className="text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Tipo de Veículo</Label>
                <Select
                  value={watchedValues.vehicle_type || ""}
                  onValueChange={(value) =>
                    setValue("vehicle_type", value as "CARGA" | "TANQUE")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARGA">Carga</SelectItem>
                    <SelectItem value="TANQUE">Tanque</SelectItem>
                  </SelectContent>
                </Select>
                {errors.vehicle_type && (
                  <p className="text-sm text-red-600">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Tipo de Combustível</Label>
                <Select
                  value={watchedValues.fuel_type || undefined}
                  onValueChange={(value) =>
                    setValue("fuel_type", value as "DIESEL" | "GASOLINE" | "ETHANOL" | "FLEX" | "CNG" | "ELECTRIC" | "HYBRID")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="GASOLINE">Gasolina</SelectItem>
                    <SelectItem value="ETHANOL">Etanol</SelectItem>
                    <SelectItem value="FLEX">Flex</SelectItem>
                    <SelectItem value="CNG">GNV</SelectItem>
                    <SelectItem value="ELECTRIC">Elétrico</SelectItem>
                    <SelectItem value="HYBRID">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuel_type && (
                  <p className="text-sm text-red-600">
                    {errors.fuel_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="module_capacity">
                  Capacidade do Módulo (L)
                </Label>
                <Input
                  id="module_capacity"
                  type="number"
                  {...register("module_capacity", { valueAsNumber: true })}
                  placeholder="Ex: 10000"
                  min="0"
                />
                {errors.module_capacity && (
                  <p className="text-sm text-red-600">
                    {errors.module_capacity.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar Veículo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
