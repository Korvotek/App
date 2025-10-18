# 🔑 Guia para Resolver InvalidKeyMapError

## Problema
O erro `InvalidKeyMapError` indica que a chave da API do Google Maps não está válida ou não tem as permissões corretas.

## Soluções Implementadas

### 1. **Mapa Estático como Fallback**
- ✅ Criado componente `StaticMap` que usa a API de mapas estáticos
- ✅ Funciona mesmo com chave inválida para mapas interativos
- ✅ Botão para alternar entre mapa interativo e estático

### 2. **Logs de Debug**
- ✅ Teste automático das chaves da API
- ✅ Verificação se as variáveis de ambiente estão definidas
- ✅ Logs detalhados no console

## Como Resolver a Chave da API

### Passo 1: Verificar Console
1. Abra o console do navegador (F12)
2. Procure por logs que começam com "🔑 Testando chaves da API:"
3. Verifique se as chaves estão sendo carregadas

### Passo 2: Verificar Arquivo .env.local
Certifique-se de que o arquivo `.env.local` contém:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDy56rmFLsCzvGEIc1VaDH3a1J7_q4Rc-I
NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY=AIzaSyDy56rmFLsCzvGEIc1VaDH3a1J7_q4Rc-I
```

### Passo 3: Verificar Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para "APIs & Services" > "Credentials"
3. Verifique se a chave está ativa
4. Verifique se as APIs estão habilitadas:
   - Maps JavaScript API
   - Geocoding API
   - Static Maps API

### Passo 4: Verificar Restrições
1. Na chave da API, verifique as restrições:
   - **Application restrictions**: Deve permitir localhost:3005
   - **API restrictions**: Deve incluir as APIs necessárias

### Passo 5: Usar Mapa Estático
Se o mapa interativo não funcionar, use o mapa estático:
1. Clique em "Usar mapa estático" na tela
2. O mapa estático funciona com menos permissões

## APIs Necessárias
- ✅ Maps JavaScript API (para mapa interativo)
- ✅ Geocoding API (para converter endereços)
- ✅ Static Maps API (para mapa estático)

## Teste Rápido
Execute no console do navegador:
```javascript
console.log("Chave Maps:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
console.log("Chave Geocode:", process.env.NEXT_PUBLIC_GOOGLE_GEOCODE_API_KEY);
```

