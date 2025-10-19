import { z } from "zod";

// Função para validar CPF brasileiro
function isValidCpf(cpf: string): boolean {
  // Remove formatação
  const cleanCpf = cpf.replace(/[.\-\s]/g, "");
  
  // Verifica se tem 11 dígitos
  if (!/^\d{11}$/.test(cleanCpf)) {
    return false;
  }
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
}

// Validação de CPF brasileiro
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

// Validação de telefone brasileiro - aceita apenas números
const phoneRegex = /^\d{10,11}$/;

export const workerRegistrationSchema = z.object({
  display_name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z.string()
    .email("Email deve ser válido")
    .max(100, "Email deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true; // Telefone é opcional
      return phoneRegex.test(phone);
    }, "Telefone deve ter 10 ou 11 dígitos")
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
