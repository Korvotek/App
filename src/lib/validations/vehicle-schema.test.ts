import { describe, it, expect } from "vitest";
import { vehicleRegistrationSchema } from "./vehicle-schema";

describe("vehicleRegistrationSchema", () => {
  const currentYear = new Date().getFullYear();

  describe("Validações de sucesso", () => {
    it("deve validar um veículo completo com todos os campos", () => {
      const validVehicle = {
        brand: "Mercedes-Benz",
        model: "Actros 2651",
        license_plate: "ABC-1234",
        year: 2023,
        vehicle_type: "CARGA" as const,
        fuel_type: "Diesel",
        module_capacity: 15000,
      };

      const result = vehicleRegistrationSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validVehicle);
      }
    });

    it("deve validar um veículo com campos opcionais vazios", () => {
      const minimalVehicle = {
        brand: "Volkswagen",
        model: "Constellation",
        license_plate: "XYZ-9876",
        year: 2022,
      };

      const result = vehicleRegistrationSchema.safeParse(minimalVehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar com marca de 2 caracteres (mínimo)", () => {
      const vehicle = {
        brand: "VW",
        model: "Caminhão",
        license_plate: "DEF-5678",
        year: 2021,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar com modelo de 2 caracteres (mínimo)", () => {
      const vehicle = {
        brand: "Scania",
        model: "R4",
        license_plate: "GHI-1111",
        year: 2020,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar veículo tipo TANQUE", () => {
      const vehicle = {
        brand: "Volvo",
        model: "FH16",
        license_plate: "JKL-2222",
        year: 2024,
        vehicle_type: "TANQUE" as const,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar ano futuro (próximo ano)", () => {
      const vehicle = {
        brand: "Iveco",
        model: "Tector",
        license_plate: "MNO-3333",
        year: currentYear + 1,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar ano 1900 (mínimo)", () => {
      const vehicle = {
        brand: "Ford",
        model: "Modelo T",
        license_plate: "AAA-0001",
        year: 1900,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar capacidade zero", () => {
      const vehicle = {
        brand: "Renault",
        model: "Master",
        license_plate: "PQR-4444",
        year: 2023,
        module_capacity: 0,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de campo obrigatório: brand", () => {
    it("deve falhar quando brand estiver ausente", () => {
      const vehicle = {
        model: "Cargo 2428",
        license_plate: "STU-5555",
        year: 2022,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("brand");
      }
    });

    it("deve falhar quando brand tiver menos de 2 caracteres", () => {
      const vehicle = {
        brand: "V",
        model: "Caminhão",
        license_plate: "VWX-6666",
        year: 2021,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Marca deve ter pelo menos 2 caracteres",
        );
      }
    });

    it("deve falhar quando brand for string vazia", () => {
      const vehicle = {
        brand: "",
        model: "Modelo X",
        license_plate: "YZA-7777",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe("Validações de campo obrigatório: model", () => {
    it("deve falhar quando model estiver ausente", () => {
      const vehicle = {
        brand: "DAF",
        license_plate: "BCD-8888",
        year: 2022,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("model");
      }
    });

    it("deve falhar quando model tiver menos de 2 caracteres", () => {
      const vehicle = {
        brand: "MAN",
        model: "T",
        license_plate: "EFG-9999",
        year: 2021,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Modelo deve ter pelo menos 2 caracteres",
        );
      }
    });

    it("deve falhar quando model for string vazia", () => {
      const vehicle = {
        brand: "Scania",
        model: "",
        license_plate: "HIJ-0000",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe("Validações de campo obrigatório: license_plate", () => {
    it("deve falhar quando license_plate estiver ausente", () => {
      const vehicle = {
        brand: "Mercedes",
        model: "Axor",
        year: 2022,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("license_plate");
      }
    });

    it("deve falhar quando license_plate tiver menos de 7 caracteres", () => {
      const vehicle = {
        brand: "Ford",
        model: "Cargo",
        license_plate: "ABC123",
        year: 2021,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Placa deve ter pelo menos 7 caracteres",
        );
      }
    });

    it("deve falhar quando license_plate for string vazia", () => {
      const vehicle = {
        brand: "Volvo",
        model: "FM",
        license_plate: "",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve aceitar placa com 7 caracteres exatos", () => {
      const vehicle = {
        brand: "Iveco",
        model: "Daily",
        license_plate: "ABC1234",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve aceitar placa com mais de 7 caracteres", () => {
      const vehicle = {
        brand: "Volkswagen",
        model: "Delivery",
        license_plate: "ABC-1D34",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de campo obrigatório: year", () => {
    it("deve falhar quando year estiver ausente", () => {
      const vehicle = {
        brand: "Renault",
        model: "Master",
        license_plate: "KLM-1111",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("year");
      }
    });

    it("deve falhar quando year for menor que 1900", () => {
      const vehicle = {
        brand: "Chevrolet",
        model: "Silverado",
        license_plate: "NOP-2222",
        year: 1899,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Ano deve ser maior que 1900",
        );
      }
    });

    it("deve falhar quando year for mais de 1 ano no futuro", () => {
      const vehicle = {
        brand: "Toyota",
        model: "Hilux",
        license_plate: "QRS-3333",
        year: currentYear + 2,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Ano não pode ser futuro",
        );
      }
    });

    it("deve aceitar ano atual", () => {
      const vehicle = {
        brand: "Fiat",
        model: "Ducato",
        license_plate: "TUV-4444",
        year: currentYear,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de vehicle_type (enum)", () => {
    it("deve aceitar tipo CARGA", () => {
      const vehicle = {
        brand: "Scania",
        model: "P320",
        license_plate: "WXY-5555",
        year: 2023,
        vehicle_type: "CARGA" as const,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve aceitar tipo TANQUE", () => {
      const vehicle = {
        brand: "Mercedes",
        model: "Atego",
        license_plate: "ZAB-6666",
        year: 2023,
        vehicle_type: "TANQUE" as const,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve falhar com tipo inválido", () => {
      const vehicle = {
        brand: "Volvo",
        model: "FH",
        license_plate: "CDE-7777",
        year: 2023,
        vehicle_type: "PASSEIO",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve aceitar ausência de vehicle_type (opcional)", () => {
      const vehicle = {
        brand: "DAF",
        model: "XF",
        license_plate: "FGH-8888",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de module_capacity", () => {
    it("deve aceitar capacidade positiva", () => {
      const vehicle = {
        brand: "Iveco",
        model: "Stralis",
        license_plate: "IJK-9999",
        year: 2023,
        module_capacity: 5000,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve falhar com capacidade negativa", () => {
      const vehicle = {
        brand: "MAN",
        model: "TGX",
        license_plate: "LMN-0000",
        year: 2023,
        module_capacity: -100,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacidade deve ser positiva",
        );
      }
    });

    it("deve aceitar ausência de module_capacity (opcional)", () => {
      const vehicle = {
        brand: "Scania",
        model: "G440",
        license_plate: "OPQ-1234",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve aceitar capacidade grande (20 toneladas)", () => {
      const vehicle = {
        brand: "Volvo",
        model: "FMX",
        license_plate: "RST-5678",
        year: 2023,
        module_capacity: 20000,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de fuel_type", () => {
    it("deve aceitar fuel_type quando fornecido", () => {
      const vehicle = {
        brand: "Ford",
        model: "F-4000",
        license_plate: "UVW-9012",
        year: 2023,
        fuel_type: "Diesel S10",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve aceitar ausência de fuel_type (opcional)", () => {
      const vehicle = {
        brand: "Chevrolet",
        model: "S10",
        license_plate: "XYZ-3456",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it("deve aceitar diferentes tipos de combustível", () => {
      const vehicle = {
        brand: "Toyota",
        model: "Bandeirante",
        license_plate: "ABC-7890",
        year: 2023,
        fuel_type: "Gasolina",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });
  });

  describe("Validações de tipos incorretos", () => {
    it("deve falhar quando brand não for string", () => {
      const vehicle = {
        brand: 123,
        model: "Modelo X",
        license_plate: "DEF-1111",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando model não for string", () => {
      const vehicle = {
        brand: "Mercedes",
        model: 456,
        license_plate: "GHI-2222",
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando license_plate não for string", () => {
      const vehicle = {
        brand: "Volvo",
        model: "FH16",
        license_plate: 789,
        year: 2023,
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando year não for número", () => {
      const vehicle = {
        brand: "Scania",
        model: "R450",
        license_plate: "JKL-3333",
        year: "2023",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("deve falhar quando module_capacity não for número", () => {
      const vehicle = {
        brand: "DAF",
        model: "CF",
        license_plate: "MNO-4444",
        year: 2023,
        module_capacity: "5000",
      };

      const result = vehicleRegistrationSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe("Casos de uso do mundo real", () => {
    it("deve validar caminhão tanque completo", () => {
      const tankTruck = {
        brand: "Scania",
        model: "P410",
        license_plate: "XYZ-1A23",
        year: 2024,
        vehicle_type: "TANQUE" as const,
        fuel_type: "Diesel",
        module_capacity: 30000,
      };

      const result = vehicleRegistrationSchema.safeParse(tankTruck);
      expect(result.success).toBe(true);
    });

    it("deve validar caminhão de carga simples", () => {
      const cargaTruck = {
        brand: "Mercedes-Benz",
        model: "Accelo 1016",
        license_plate: "ABC-9876",
        year: 2023,
        vehicle_type: "CARGA" as const,
      };

      const result = vehicleRegistrationSchema.safeParse(cargaTruck);
      expect(result.success).toBe(true);
    });

    it("deve validar veículo antigo (1950)", () => {
      const oldVehicle = {
        brand: "Chevrolet",
        model: "Brasil",
        license_plate: "AAA-1111",
        year: 1950,
      };

      const result = vehicleRegistrationSchema.safeParse(oldVehicle);
      expect(result.success).toBe(true);
    });

    it("deve validar van sem tipo específico", () => {
      const van = {
        brand: "Renault",
        model: "Master",
        license_plate: "BBB-2222",
        year: 2024,
        fuel_type: "Diesel",
      };

      const result = vehicleRegistrationSchema.safeParse(van);
      expect(result.success).toBe(true);
    });
  });
});
