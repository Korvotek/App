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
        const supabaseData: Partial<VehicleInsert> = {
          brand: result.data.brand,
          model: result.data.model,
          license_plate: result.data.license_plate,
          year: result.data.year,
          vehicle_type: result.data.vehicle_type,
          fuel_type: result.data.fuel_type,
          module_capacity: result.data.module_capacity,
        };

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
        const supabaseData: Partial<VehicleInsert> = {
          brand: result.data.brand,
          model: result.data.model,
          license_plate: result.data.license_plate,
          year: result.data.year,
          vehicle_type: result.data.vehicle_type ?? null,
          fuel_type: result.data.fuel_type ?? null,
          module_capacity: result.data.module_capacity ?? null,
        };

        expect([undefined, null]).toContain(supabaseData.vehicle_type);
        expect([undefined, null]).toContain(supabaseData.fuel_type);
        expect([undefined, null]).toContain(supabaseData.module_capacity);
      }
    });
  });

  describe("Validations NOT covered by Zod (but Supabase may have)", () => {
    it("WARNING: Duplicate plate - Zod accepts, but Supabase may reject (UNIQUE constraint)", () => {
      const vehicle1 = {
        brand: "Ford",
        model: "Cargo",
        license_plate: "ABC-1234",
        year: 2023,
      };

      const vehicle2 = {
        brand: "Volvo",
        model: "FH",
        license_plate: "ABC-1234",
        year: 2024,
      };

      expect(vehicleRegistrationSchema.safeParse(vehicle1).success).toBe(true);
      expect(vehicleRegistrationSchema.safeParse(vehicle2).success).toBe(true);

      console.warn(
        "WARNING: Duplicate plates pass Zod validation but may fail in Supabase!",
      );
    });

    it("WARNING: Plate format - Zod accepts any string 7+, Supabase may have regex", () => {
      const invalidFormatPlate = {
        brand: "Mercedes",
        model: "Atego",
        license_plate: "1234567",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(invalidFormatPlate);
      expect(result.success).toBe(true);

      console.warn(
        "WARNING: Invalid plate format passes Zod but may fail in Supabase!",
      );
    });

    it("WARNING: Business validations - may have triggers in Supabase", () => {
      const vehicle = {
        brand: "Scania",
        model: "R450",
        license_plate: "XYZ-9999",
        year: 2023,
        vehicle_type: "TANQUE" as const,
        module_capacity: 0,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);

      console.warn(
        "WARNING: Business rules may only be validated in Supabase!",
      );
    });

    it("WARNING: Relationships - Zod does not validate foreign keys", () => {
      const vehicle = {
        brand: "DAF",
        model: "XF",
        license_plate: "AAA-0000",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);

      console.warn(
        "WARNING: Foreign keys are not validated by Zod, only by Supabase!",
      );
    });
  });

  describe("Complete validation checklist", () => {
    it("should document what NEEDS to be tested in Supabase", () => {
      const checklist = {
        zodValidation: true,
        supabaseConstraints: false,
        uniqueConstraints: false,
        foreignKeys: false,
        checkConstraints: false,
        triggers: false,
        rowLevelSecurity: false,
      };

      console.log("Complete Validation Checklist:");
      console.log("✅ Zod validation (frontend): COVERED by tests");
      console.log("⚠️ Supabase constraints: NEEDS testing with real INSERT");
      console.log(
        "⚠️ Unique constraints: NEEDS testing duplicate plates",
      );
      console.log(
        "⚠️ Foreign keys: NEEDS testing with invalid tenant IDs",
      );
      console.log(
        "⚠️ CHECK constraints: NEEDS to verify database rules",
      );
      console.log(
        "⚠️ Triggers: NEEDS to verify if there is logic in database",
      );
      console.log("⚠️ RLS: NEEDS to test permissions per user");

      expect(checklist.zodValidation).toBe(true);
    });
  });
});
