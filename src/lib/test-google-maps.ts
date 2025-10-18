export async function testGoogleMapsAPI() {
  console.log("🔑 Testando chaves da API:");
  console.log("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "✅ Definida" : "❌ Não definida");
  console.log("NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY:", process.env.NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY ? "✅ Definida" : "❌ Não definida");
  
  const testAddresses = [
    "São Paulo, SP, Brasil",
    "Rua das Flores, 123, Centro, São Paulo, SP, 01234-567",
    "Centro, São Paulo, SP",
    "São Paulo, SP"
  ];
  
  const results = [];
  
  for (const testAddress of testAddresses) {
    try {
      console.log(`Testando endereço: ${testAddress}`);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          testAddress
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY}&region=BR`
      );
      
      const data = await response.json();
      
      console.log(`Resultado para "${testAddress}":`, {
        status: data.status,
        results: data.results?.length || 0,
        error_message: data.error_message,
      });
      
      results.push({
        address: testAddress,
        success: data.status === "OK",
        status: data.status,
        error: data.error_message,
        results: data.results?.length || 0,
      });
    } catch (error) {
      console.error(`Erro no teste para "${testAddress}":`, error);
      results.push({
        address: testAddress,
        success: false,
        status: "ERROR",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        results: 0,
      });
    }
  }
  
  return results;
}
