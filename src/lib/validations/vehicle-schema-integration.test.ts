import { describe, it, expect } from "vitest";
import { vehicleRegistrationSchema } from "./vehicle-schema";
import type { Database } from "@/lib/supabase/database.types";

type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];

describe("vehicleRegistrationSchema - Integração com Supabase", () => {
  describe("Compatibilidade de tipos com database.types.ts", () => {
    it("deve ter todos os campos obrigatórios do Supabase", () => {
      const validVehicle = {
        brand: "Mercedes-Benz",
        model: "Actros",
        license_plate: "ABC-1234",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verifica se os dados validados podem ser atribuídos ao tipo do Supabase
        const supabaseData: Partial<VehicleInsert> = {
          brand: result.data.brand,
          model: result.data.model,
          license_plate: result.data.license_plate,
          year: result.data.year,
          vehicle_type: result.data.vehicle_type,
          fuel_type: result.data.fuel_type,
          module_capacity: result.data.module_capacity,
        };

        // Se chegar aqui sem erro de tipo, a compatibilidade está OK
        expect(supabaseData).toBeDefined();
      }
    });

    it("deve mapear corretamente vehicle_type enum", () => {
      const vehicleCarga = {
        brand: "Scania",
        model: "P320",
        license_plate: "XYZ-5678",
        year: 2023,
        vehicle_type: "CARGA" as const,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicleCarga);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verifica se o enum é compatível com o tipo do Supabase
        const vehicleType: VehicleInsert["vehicle_type"] =
          result.data.vehicle_type || null;
        expect(["CARGA", "TANQUE", null, undefined]).toContain(vehicleType);
      }
    });

    it("deve lidar com campos opcionais do Supabase", () => {
      const minimalVehicle = {
        brand: "Volvo",
        model: "FH16",
        license_plate: "DEF-9012",
        year: 2024,
      };

      const result = vehicleRegistrationSchema.safeParse(minimalVehicle);
      expect(result.success).toBe(true);

      if (result.success) {
        // Campos opcionais devem ser compatíveis com null/undefined do Supabase
        const supabaseData: Partial<VehicleInsert> = {
          brand: result.data.brand,
          model: result.data.model,
          license_plate: result.data.license_plate,
          year: result.data.year,
          vehicle_type: result.data.vehicle_type ?? null,
          fuel_type: result.data.fuel_type ?? null,
          module_capacity: result.data.module_capacity ?? null,
        };

        // Campos opcionais do Zod ficam undefined, mas podem ser null no Supabase
        expect([undefined, null]).toContain(supabaseData.vehicle_type);
        expect([undefined, null]).toContain(supabaseData.fuel_type);
        expect([undefined, null]).toContain(supabaseData.module_capacity);
      }
    });
  });

  describe("⚠️ Validações que o Zod NÃO cobre (mas o Supabase pode ter)", () => {
    it("AVISO: Placa duplicada - Zod aceita, mas Supabase pode rejeitar (UNIQUE constraint)", () => {
      const vehicle1 = {
        brand: "Ford",
        model: "Cargo",
        license_plate: "ABC-1234", // Mesma placa
        year: 2023,
      };

      const vehicle2 = {
        brand: "Volvo",
        model: "FH",
        license_plate: "ABC-1234", // Mesma placa
        year: 2024,
      };

      // Zod aceita ambos
      expect(vehicleRegistrationSchema.safeParse(vehicle1).success).toBe(true);
      expect(vehicleRegistrationSchema.safeParse(vehicle2).success).toBe(true);

      // ⚠️ MAS: O Supabase rejeitará o segundo INSERT se houver UNIQUE constraint
      console.warn(
        "⚠️ Placas duplicadas passam no Zod, mas podem falhar no Supabase!",
      );
    });

    it("AVISO: Formato de placa - Zod aceita qualquer string 7+, Supabase pode ter regex", () => {
      const invalidFormatPlate = {
        brand: "Mercedes",
        model: "Atego",
        license_plate: "1234567", // Sem letras, mas 7+ caracteres
        year: 2023,
      };

      // Zod aceita (apenas valida tamanho mínimo)
      const result = vehicleRegistrationSchema.safeParse(invalidFormatPlate);
      expect(result.success).toBe(true);

      // ⚠️ MAS: Supabase pode ter CHECK constraint validando formato brasileiro
      console.warn(
        "⚠️ Formato de placa inválido passa no Zod, mas pode falhar no Supabase!",
      );
    });

    it("AVISO: Validações de negócio - podem existir triggers no Supabase", () => {
      const vehicle = {
        brand: "Scania",
        model: "R450",
        license_plate: "XYZ-9999",
        year: 2023,
        vehicle_type: "TANQUE" as const,
        module_capacity: 0, // Tanque com capacidade zero
      };

      // Zod aceita
      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);

      // ⚠️ MAS: Pode haver trigger no Supabase que rejeita TANQUE com capacidade 0
      console.warn(
        "⚠️ Regras de negócio podem ser validadas apenas no Supabase!",
      );
    });

    it("AVISO: Relacionamentos - Zod não valida foreign keys", () => {
      const vehicle = {
        brand: "DAF",
        model: "XF",
        license_plate: "AAA-0000",
        year: 2023,
        // Se houver tenant_id como FK, Zod não valida se existe
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);

      // ⚠️ MAS: Supabase pode rejeitar se tenant_id não existir na tabela tenants
      console.warn(
        "⚠️ Foreign keys não são validadas pelo Zod, apenas pelo Supabase!",
      );
    });
  });

  describe("📋 Checklist de validação completa", () => {
    it("deve documentar o que PRECISA ser testado no Supabase", () => {
      const checklist = {
        zodValidation: true, // ✅ Testado aqui
        supabaseConstraints: false, // ❌ Precisa testar com dados reais
        uniqueConstraints: false, // ❌ Precisa testar duplicação
        foreignKeys: false, // ❌ Precisa testar relacionamentos
        checkConstraints: false, // ❌ Precisa testar regras de CHECK
        triggers: false, // ❌ Precisa testar triggers
        rowLevelSecurity: false, // ❌ Precisa testar RLS policies
      };

      console.log("📋 Checklist de Validação Completa:");
      console.log("✅ Validação Zod (frontend): COBERTA por testes");
      console.log("⚠️ Constraints do Supabase: PRECISA testar com INSERT real");
      console.log(
        "⚠️ Unique constraints: PRECISA testar tentando duplicar placas",
      );
      console.log(
        "⚠️ Foreign keys: PRECISA testar com IDs inválidos de tenant",
      );
      console.log(
        "⚠️ CHECK constraints: PRECISA verificar regras do banco",
      );
      console.log(
        "⚠️ Triggers: PRECISA verificar se há lógica no banco",
      );
      console.log("⚠️ RLS: PRECISA testar permissões por usuário");

      expect(checklist.zodValidation).toBe(true);
    });
  });
});
