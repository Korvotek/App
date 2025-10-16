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

export function VehicleRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      fuel_type: "",
      module_capacity: undefined,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: VehicleRegistrationData) => {
    setIsSubmitting(true);
    try {
      await registerVehicle(data);
      toast.success("Veículo cadastrado com sucesso!");
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cadastro de Veículo</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para registrar um novo veículo no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
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
                  {...register("license_plate")}
                  placeholder="ABC-1234"
                  className="uppercase"
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

          {/* Informações Técnicas */}
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
                <Input
                  id="fuel_type"
                  {...register("fuel_type")}
                  placeholder="Ex: Diesel, Gasolina, Flex"
                />
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

          {/* Botões */}
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
