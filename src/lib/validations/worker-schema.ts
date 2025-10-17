import { z } from "zod";

export const workerRegistrationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().optional(),
  email: z.string().email("Email deve ser válido").optional().or(z.literal("")),
  phone: z.string().optional(),
  employee_number: z.string().min(1, "Número do funcionário é obrigatório"),
  hire_date: z.string().min(1, "Data de contratação é obrigatória"),
  is_driver: z.boolean(),
  is_helper: z.boolean(),
});

export type WorkerRegistrationData = z.infer<typeof workerRegistrationSchema>;
