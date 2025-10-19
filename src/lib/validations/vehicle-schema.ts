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
    .refine((plate) => {
      if (!plate || plate.trim() === "") return false;
      
      // Remove caracteres não alfanuméricos para contar apenas letras e números
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');
      
      // Verifica se tem exatamente 7 caracteres
      if (cleanPlate.length !== 7) {
        return false;
      }
      
      // Verifica se é formato antigo (ABC1234) ou Mercosul (ABC1D23)
      const oldFormat = /^[A-Z]{3}[0-9]{4}$/.test(cleanPlate); // ABC1234
      const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanPlate); // ABC1D23
      
      return oldFormat || mercosulFormat;
    }, "Placa deve ter exatamente 7 caracteres: ABC1234 (antigo) ou ABC1D23 (Mercosul)"),
  year: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano deve ser maior que 1900")
    .max(new Date().getFullYear() + 1, "Ano não pode ser futuro"),
  vehicle_type: z.enum(["CARGA", "TANQUE"]).optional(),
  fuel_type: z.enum([
    "DIESEL",
    "GASOLINE", 
    "ETHANOL",
    "FLEX",
    "CNG",
    "ELECTRIC",
    "HYBRID"
  ]).optional(),
  module_capacity: z.number()
    .int("Capacidade deve ser um número inteiro")
    .min(0, "Capacidade deve ser positiva")
    .max(100000, "Capacidade deve ser menor que 100.000")
    .optional(),
});

export type VehicleRegistrationData = z.infer<typeof vehicleRegistrationSchema>;
