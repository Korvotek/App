# Configurações de Charset e Encoding para o Projeto Sigelo

## Problemas Identificados e Soluções

### 1. Configurações do Next.js
- ✅ Adicionado charset UTF-8 no metadata
- ✅ Configurado middleware para garantir charset correto
- ✅ Adicionado meta tags no layout principal

### 2. Configurações de Servidor

#### Para Apache (.htaccess):
```apache
AddDefaultCharset UTF-8
AddCharset UTF-8 .html .css .js .json .xml .txt
```

#### Para Nginx (nginx.conf):
```nginx
charset utf-8;
source_charset utf-8;
add_header Content-Type "text/html; charset=utf-8" always;
```

### 3. Configurações do Browser
- ✅ Meta tag charset no HTML
- ✅ Content-Type header correto
- ✅ Configurações de segurança adicionais

### 4. Arquivos de Configuração Criados
- ✅ `.htaccess` - Para servidores Apache
- ✅ `nginx.conf` - Para servidores Nginx
- ✅ `next.config.ts` - Atualizado com configurações de charset
- ✅ `src/middleware.ts` - Middleware com headers de charset
- ✅ `src/app/layout.tsx` - Layout com meta tags de charset

### 5. Verificações Realizadas
- ✅ Arquivos TypeScript/TSX com caracteres especiais
- ✅ Configurações de fontes (Geist com subset latin)
- ✅ Headers HTTP corretos
- ✅ Meta tags HTML adequadas

### 6. Próximos Passos
1. Reiniciar o servidor de desenvolvimento
2. Limpar cache do browser
3. Verificar se os caracteres especiais estão sendo exibidos corretamente
4. Testar em diferentes browsers

### 7. Comandos para Testar
```bash
# Reiniciar o servidor
npm run dev

# Limpar cache do Next.js
rm -rf .next

# Verificar se o build está funcionando
npm run build
```

### 8. Troubleshooting
Se ainda houver problemas de charset:
1. Verificar se o arquivo está salvo em UTF-8
2. Verificar configurações do editor de código
3. Verificar configurações do servidor web
4. Verificar configurações do browser

