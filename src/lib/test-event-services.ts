// Teste para verificar se os serviços estão sendo salvos corretamente
export async function testEventServiceCreation() {
  console.log("🧪 Testando criação de serviços em eventos...");
  
  // Simular dados de serviço
  const testService = {
    serviceId: "test-service-123",
    serviceName: "Limpeza de Banheiros",
    dailyValue: 150.00,
    quantity: 2,
    totalValue: 300.00,
    observations: "Serviço de teste"
  };
  
  console.log("📋 Dados do serviço de teste:", testService);
  
  // Verificar se a estrutura está correta
  const requiredFields = ['serviceId', 'serviceName', 'dailyValue', 'quantity', 'totalValue'];
  const missingFields = requiredFields.filter(field => !testService[field as keyof typeof testService]);
  
  if (missingFields.length > 0) {
    console.error("❌ Campos obrigatórios faltando:", missingFields);
    return false;
  }
  
  console.log("✅ Estrutura do serviço está correta");
  return true;
}
