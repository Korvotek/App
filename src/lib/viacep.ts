export interface ViaCEPResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export async function geocodeViaCEP(postalCode: string): Promise<ViaCEPResult | null> {
  try {
    const cleanCEP = postalCode.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      console.log("ViaCEP não encontrou o CEP:", postalCode);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP no ViaCEP:", error);
    return null;
  }
}

export function buildAddressFromViaCEP(viaCEPResult: ViaCEPResult): string {
  const parts = [];
  
  if (viaCEPResult.logradouro) {
    parts.push(viaCEPResult.logradouro);
  }
  
  if (viaCEPResult.bairro) {
    parts.push(viaCEPResult.bairro);
  }
  
  if (viaCEPResult.localidade) {
    parts.push(viaCEPResult.localidade);
  }
  
  if (viaCEPResult.uf) {
    parts.push(viaCEPResult.uf);
  }
  
  if (viaCEPResult.cep) {
    parts.push(viaCEPResult.cep);
  }
  
  return parts.join(", ");
}

// Funções para compatibilidade com o código existente
export const fetchCEP = geocodeViaCEP;

export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length === 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}