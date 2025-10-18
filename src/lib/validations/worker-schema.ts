import { z } from "zod";

// Validação de CPF brasileiro
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

// Validação de telefone brasileiro
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/;

export const workerRegistrationSchema = z.object({
  display_name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  cpf: z.string()
    .regex(cpfRegex, "CPF deve estar no formato 000.000.000-00 ou 00000000000")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Email deve ser válido")
    .max(100, "Email deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .regex(phoneRegex, "Telefone deve estar no formato (00) 00000-0000 ou 00000000000")
    .optional()
    .or(z.literal("")),
  employee_number: z.string()
    .min(1, "Número do funcionário é obrigatório")
    .max(20, "Número do funcionário deve ter no máximo 20 caracteres")
    .regex(/^[A-Za-z0-9-_]+$/, "Número do funcionário deve conter apenas letras, números, hífens e underscores"),
  hire_date: z.string()
    .min(1, "Data de contratação é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  is_driver: z.boolean(),
  is_helper: z.boolean(),
}).refine(
  (data) => data.is_driver || data.is_helper,
  {
    message: "Funcionário deve ser motorista ou ajudante (ou ambos)",
    path: ["is_driver"],
  }
);

export type WorkerRegistrationData = z.infer<typeof workerRegistrationSchema>;
