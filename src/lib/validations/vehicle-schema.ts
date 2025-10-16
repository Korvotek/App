import { z } from "zod";

export const vehicleRegistrationSchema = z.object({
  // Informações básicas obrigatórias
  brand: z.string().min(2, "Marca deve ter pelo menos 2 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  license_plate: z.string().min(7, "Placa deve ter pelo menos 7 caracteres"),
  year: z.number().min(1900, "Ano deve ser maior que 1900").max(new Date().getFullYear() + 1, "Ano não pode ser futuro"),
  
  // Informações opcionais
  vehicle_type: z.enum(["CARGA", "TANQUE"]).optional(),
  fuel_type: z.string().optional(),
  module_capacity: z.number().min(0, "Capacidade deve ser positiva").optional(),
});

export type VehicleRegistrationData = z.infer<typeof vehicleRegistrationSchema>;
