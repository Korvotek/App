import { z } from 'zod';

export const exampleFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, insira um e-mail válido.',
  }),
  age: z.coerce.number().min(18, {
    message: 'Você deve ter pelo menos 18 anos.',
  }),
});

export type ExampleFormData = z.infer<typeof exampleFormSchema>;
