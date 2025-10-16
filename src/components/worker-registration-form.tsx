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
  workerRegistrationSchema,
  type WorkerRegistrationData,
} from "@/lib/validations/worker-schema";
import { registerWorker } from "@/actions/worker-actions";
import { toast } from "sonner";

export function WorkerRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerRegistrationData>({
    resolver: zodResolver(workerRegistrationSchema),
    defaultValues: {
      is_driver: false,
      is_helper: false,
      cpf: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: WorkerRegistrationData) => {
    setIsSubmitting(true);
    try {
      const result = await registerWorker(data);
      toast.success(result.message);
      router.push("/dashboard/funcionarios?success=true");
    } catch (error) {
      console.error("Erro ao registrar funcionário:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao registrar funcionário",
      );
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
        <CardTitle>Cadastro de Funcionário</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para registrar um novo funcionário no
          sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Nome *</Label>
                <Input
                  id="display_name"
                  {...register("display_name")}
                  placeholder="Nome do funcionário"
                />
                {errors.display_name && (
                  <p className="text-sm text-red-600">
                    {errors.display_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600">{errors.cpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="(00) 0000-0000"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_number">Número do Funcionário *</Label>
                <Input
                  id="employee_number"
                  {...register("employee_number")}
                  placeholder="Ex: FUNC001"
                />
                {errors.employee_number && (
                  <p className="text-sm text-red-600">
                    {errors.employee_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Data de Contratação *</Label>
                <Input id="hire_date" type="date" {...register("hire_date")} />
                {errors.hire_date && (
                  <p className="text-sm text-red-600">
                    {errors.hire_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Funções</Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_driver"
                      {...register("is_driver")}
                      className="rounded"
                    />
                    <Label htmlFor="is_driver">Motorista</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_helper"
                      {...register("is_helper")}
                      className="rounded"
                    />
                    <Label htmlFor="is_helper">Ajudante</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Funcionário"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
