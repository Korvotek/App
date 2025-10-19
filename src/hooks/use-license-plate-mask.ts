import { useState } from 'react';

export function useLicensePlateMask() {
  const [plateValue, setPlateValue] = useState('');

  const formatLicensePlate = (value: string) => {
    // Remove todos os caracteres não alfanuméricos e converte para maiúsculo
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Aplica a máscara baseada no tamanho e formato
    if (cleanValue.length <= 3) {
      return cleanValue;
    } else if (cleanValue.length <= 7) {
      // Verifica se é formato Mercosul (ABC1D23) ou antigo (ABC1234)
      if (cleanValue.length === 7 && /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanValue)) {
        // Formato Mercosul: ABC1D23 (sem hífen)
        return cleanValue;
      } else {
        // Formato antigo: ABC-1234
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
      }
    } else if (cleanValue.length <= 8) {
      // Formato Mercosul: ABC1D23 (sem hífen)
      return cleanValue;
    } else {
      // Limita a 8 caracteres
      return cleanValue.slice(0, 8);
    }
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicensePlate(e.target.value);
    setPlateValue(formatted);
  };

  const getPlateNumbers = () => {
    return plateValue.replace(/[^A-Z0-9]/g, '');
  };

  return {
    plateValue,
    handlePlateChange,
    getPlateNumbers,
    setPlateValue
  };
}
