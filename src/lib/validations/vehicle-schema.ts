import { z } from "zod";

// Validação de placa brasileira (formato antigo e Mercosul)
const licensePlateRegex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

export const vehicleRegistrationSchema = z.object({
  brand: z.string()
    .min(2, "Marca deve ter pelo menos 2 caracteres")
    .max(50, "Marca deve ter no máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Marca deve conter apenas letras e espaços"),
  model: z.string()
    .min(2, "Modelo deve ter pelo menos 2 caracteres")
    .max(100, "Modelo deve ter no máximo 100 caracteres"),
  license_plate: z.string()
    .min(7, "Placa deve ter pelo menos 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres")
    .regex(licensePlateRegex, "Formato de placa inválido (use formato ABC-1234 ou ABC1D23)"),
  year: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano deve ser maior que 1900")
    .max(new Date().getFullYear() + 1, "Ano não pode ser futuro"),
  vehicle_type: z.enum(["CARGA", "TANQUE"]).optional(),
  fuel_type: z.string()
    .max(50, "Tipo de combustível deve ter no máximo 50 caracteres")
    .optional(),
  module_capacity: z.number()
    .int("Capacidade deve ser um número inteiro")
    .min(0, "Capacidade deve ser positiva")
    .max(100000, "Capacidade deve ser menor que 100.000")
    .optional(),
});

export type VehicleRegistrationData = z.infer<typeof vehicleRegistrationSchema>;
