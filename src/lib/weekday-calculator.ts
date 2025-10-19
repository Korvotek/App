/**
 * Utilitários para cálculo de dias da semana disponíveis
 */

export interface WeekdayOption {
  value: string;
  label: string;
  dayNumber: number;
  isAvailable: boolean;
  date?: string;
}

/**
 * Calcula quais dias da semana estão disponíveis em um período específico
 */
export function calculateAvailableWeekdays(
  startDate: string,
  endDate: string
): WeekdayOption[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Mapeamento dos dias da semana
  const weekdays = [
    { value: "SUNDAY", label: "Domingo", dayNumber: 0 },
    { value: "MONDAY", label: "Segunda", dayNumber: 1 },
    { value: "TUESDAY", label: "Terça", dayNumber: 2 },
    { value: "WEDNESDAY", label: "Quarta", dayNumber: 3 },
    { value: "THURSDAY", label: "Quinta", dayNumber: 4 },
    { value: "FRIDAY", label: "Sexta", dayNumber: 5 },
    { value: "SATURDAY", label: "Sábado", dayNumber: 6 },
  ];

  // Calcular quais dias da semana existem no período
  const availableDays = new Set<number>();
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    availableDays.add(currentDate.getDay());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Retornar opções com informações de disponibilidade
  return weekdays.map(weekday => ({
    ...weekday,
    isAvailable: availableDays.has(weekday.dayNumber),
    date: getFirstOccurrenceDate(startDate, weekday.dayNumber)
  }));
}

/**
 * Encontra a primeira ocorrência de um dia da semana específico no período
 */
function getFirstOccurrenceDate(startDate: string, targetDayNumber: number): string | undefined {
  const start = new Date(startDate);
  const currentDate = new Date(start);
  
  // Encontrar o primeiro dia da semana correspondente
  while (currentDate.getDay() !== targetDayNumber) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return currentDate.toISOString().split('T')[0];
}

/**
 * Valida se um período tem pelo menos um dia disponível para limpeza
 */
export function validatePeriodForCleaning(
  startDate: string,
  endDate: string
): { isValid: boolean; message?: string; availableDays: WeekdayOption[] } {
  const availableDays = calculateAvailableWeekdays(startDate, endDate);
  const hasAvailableDays = availableDays.some(day => day.isAvailable);
  
  if (!hasAvailableDays) {
    return {
      isValid: false,
      message: "O período selecionado não possui dias disponíveis para limpeza",
      availableDays
    };
  }
  
  return {
    isValid: true,
    availableDays
  };
}

/**
 * Formata a lista de dias disponíveis para exibição
 */
export function formatAvailableDays(availableDays: WeekdayOption[]): string {
  const available = availableDays.filter(day => day.isAvailable);
  
  if (available.length === 0) {
    return "Nenhum dia disponível";
  }
  
  if (available.length === 1) {
    return available[0].label;
  }
  
  if (available.length === 2) {
    return `${available[0].label} e ${available[1].label}`;
  }
  
  const lastDay = available[available.length - 1];
  const otherDays = available.slice(0, -1).map(day => day.label).join(", ");
  
  return `${otherDays} e ${lastDay.label}`;
}

/**
 * Exemplo de uso e teste
 */
export function testWeekdayCalculation() {
  console.log("=== TESTE: Cálculo de Dias Disponíveis ===");
  
  // Teste 1: Período curto (20/10 a 22/10)
  console.log("\n1. Período: 20/10/2024 a 22/10/2024");
  const test1 = calculateAvailableWeekdays("2024-10-20", "2024-10-22");
  test1.forEach(day => {
    console.log(`${day.label}: ${day.isAvailable ? '✅' : '❌'} ${day.date || ''}`);
  });
  
  // Teste 2: Período longo (01/10 a 31/10)
  console.log("\n2. Período: 01/10/2024 a 31/10/2024");
  const test2 = calculateAvailableWeekdays("2024-10-01", "2024-10-31");
  test2.forEach(day => {
    console.log(`${day.label}: ${day.isAvailable ? '✅' : '❌'} ${day.date || ''}`);
  });
  
  // Teste 3: Período de um dia só
  console.log("\n3. Período: 20/10/2024 a 20/10/2024");
  const test3 = calculateAvailableWeekdays("2024-10-20", "2024-10-20");
  test3.forEach(day => {
    console.log(`${day.label}: ${day.isAvailable ? '✅' : '❌'} ${day.date || ''}`);
  });
  
  // Teste 4: Validação
  console.log("\n4. Validação de período:");
  const validation = validatePeriodForCleaning("2024-10-20", "2024-10-22");
  console.log(`Válido: ${validation.isValid}`);
  console.log(`Dias disponíveis: ${formatAvailableDays(validation.availableDays)}`);
}
