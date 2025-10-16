import { describe, it, expect } from "vitest";
import { workerRegistrationSchema } from "./worker-schema";

describe("workerRegistrationSchema", () => {
  describe("Validações de sucesso", () => {
    it("deve validar um funcionário completo com todos os campos", () => {
      const validWorker = {
        display_name: "João Silva",
        cpf: "123.456.789-00",
        email: "joao.silva@example.com",
        phone: "(11) 98765-4321",
        employee_number: "EMP001",
        hire_date: "2024-01-15",
        is_driver: true,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(validWorker);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validWorker);
      }
    });

    it("deve validar um funcionário com campos opcionais vazios", () => {
      const minimalWorker = {
        display_name: "Maria Santos",
        employee_number: "EMP002",
        hire_date: "2024-02-01",
        is_driver: false,
        is_helper: true,
      };

      const result = workerRegistrationSchema.safeParse(minimalWorker);
      expect(result.success).toBe(true);
    });

    it("deve aceitar email vazio como string vazia", () => {
      const workerWithEmptyEmail = {
        display_name: "Pedro Costa",
        email: "",
        employee_number: "EMP003",
        hire_date: "2024-03-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(workerWithEmptyEmail);
      expect(result.success).toBe(true);
    });

    it("deve validar com nome de 2 caracteres (mínimo)", () => {
      const worker = {
        display_name: "Ab",
        employee_number: "EMP004",
        hire_date: "2024-04-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });

    it("deve validar motorista e ajudante simultaneamente", () => {
      const worker = {
        display_name: "Carlos Lima",
        employee_number: "EMP005",
        hire_date: "2024-05-01",
        is_driver: true,
        is_helper: true,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de campo obrigatório: display_name", () => {
    it("deve falhar quando display_name estiver ausente", () => {
      const worker = {
        employee_number: "EMP006",
        hire_date: "2024-06-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("display_name");
      }
    });

    it("deve falhar quando display_name tiver menos de 2 caracteres", () => {
      const worker = {
        display_name: "A",
        employee_number: "EMP007",
        hire_date: "2024-07-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Nome deve ter pelo menos 2 caracteres",
        );
      }
    });

    it("deve falhar quando display_name for string vazia", () => {
      const worker = {
        display_name: "",
        employee_number: "EMP008",
        hire_date: "2024-08-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
    });
  });

  describe("Validações de campo obrigatório: employee_number", () => {
    it("deve falhar quando employee_number estiver ausente", () => {
      const worker = {
        display_name: "Ana Paula",
        hire_date: "2024-09-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("employee_number");
      }
    });

    it("deve falhar quando employee_number for string vazia", () => {
      const worker = {
        display_name: "Roberto Dias",
        employee_number: "",
        hire_date: "2024-10-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Número do funcionário é obrigatório",
        );
      }
    });
  });

  describe("Validações de campo obrigatório: hire_date", () => {
    it("deve falhar quando hire_date estiver ausente", () => {
      const worker = {
        display_name: "Fernanda Souza",
        employee_number: "EMP011",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("hire_date");
      }
    });

    it("deve falhar quando hire_date for string vazia", () => {
      const worker = {
        display_name: "Lucas Oliveira",
        employee_number: "EMP012",
        hire_date: "",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Data de contratação é obrigatória",
        );
      }
    });
  });

  describe("Validações de email", () => {
    it("deve falhar com email inválido", () => {
      const worker = {
        display_name: "Juliana Costa",
        email: "email-invalido",
        employee_number: "EMP013",
        hire_date: "2024-11-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email deve ser válido");
      }
    });

    it("deve aceitar email válido", () => {
      const worker = {
        display_name: "Ricardo Alves",
        email: "ricardo.alves@empresa.com.br",
        employee_number: "EMP014",
        hire_date: "2024-12-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });

    it("deve aceitar ausência de email", () => {
      const worker = {
        display_name: "Patrícia Mendes",
        employee_number: "EMP015",
        hire_date: "2025-01-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de campos booleanos", () => {
    it("deve falhar quando is_driver estiver ausente", () => {
      const worker = {
        display_name: "Bruno Ferreira",
        employee_number: "EMP016",
        hire_date: "2025-02-01",
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("is_driver");
      }
    });

    it("deve falhar quando is_helper estiver ausente", () => {
      const worker = {
        display_name: "Camila Rocha",
        employee_number: "EMP017",
        hire_date: "2025-03-01",
        is_driver: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("is_helper");
      }
    });

    it("deve aceitar false para ambos os campos booleanos", () => {
      const worker = {
        display_name: "Diego Santos",
        employee_number: "EMP018",
        hire_date: "2025-04-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de campos opcionais", () => {
    it("deve aceitar CPF quando fornecido", () => {
      const worker = {
        display_name: "Eduardo Lima",
        cpf: "987.654.321-00",
        employee_number: "EMP019",
        hire_date: "2025-05-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone quando fornecido", () => {
      const worker = {
        display_name: "Fabiana Martins",
        phone: "(21) 91234-5678",
        employee_number: "EMP020",
        hire_date: "2025-06-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });

    it("deve aceitar todos os campos opcionais juntos", () => {
      const worker = {
        display_name: "Gabriel Souza",
        cpf: "111.222.333-44",
        email: "gabriel@example.com",
        phone: "(31) 99999-8888",
        employee_number: "EMP021",
        hire_date: "2025-07-01",
        is_driver: true,
        is_helper: true,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de tipos incorretos", () => {
    it("deve falhar quando display_name não for string", () => {
      const worker = {
        display_name: 123,
        employee_number: "EMP022",
        hire_date: "2025-08-01",
        is_driver: false,
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando is_driver não for boolean", () => {
      const worker = {
        display_name: "Helena Campos",
        employee_number: "EMP023",
        hire_date: "2025-09-01",
        is_driver: "true",
        is_helper: false,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando is_helper não for boolean", () => {
      const worker = {
        display_name: "Igor Pinto",
        employee_number: "EMP024",
        hire_date: "2025-10-01",
        is_driver: false,
        is_helper: 1,
      };

      const result = workerRegistrationSchema.safeParse(worker);
      expect(result.success).toBe(false);
    });
  });
});
