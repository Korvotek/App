# Sigelo

Projeto criado com Next.js 15 e as melhores bibliotecas do ecossistema React.

## Stack Tecnológica

- **Next.js 15** (App Router) - Framework React com SSR e SSG
- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI reutilizáveis e acessíveis
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Storage)
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono e cache
- **Zustand** - Gerenciamento de estado global
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de schemas TypeScript-first

## Estrutura do Projeto

```
sigelo/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── layout.tsx          # Layout raiz com providers
│   │   └── page.tsx            # Página inicial
│   ├── components/             # Componentes React
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── lib/                    # Utilitários e configurações
│   │   ├── supabase/           # Configuração Supabase
│   │   │   ├── client.ts       # Cliente Supabase (Client Components)
│   │   │   ├── server.ts       # Cliente Supabase (Server Components)
│   │   │   ├── hooks.ts        # Hooks React Query + Supabase
│   │   │   └── database.types.ts # Tipos TypeScript do banco
│   │   ├── utils.ts            # Funções utilitárias
│   │   └── validations/        # Schemas Zod
│   ├── providers/              # Context Providers
│   │   └── query-provider.tsx  # Provider do React Query
│   └── store/                  # Stores Zustand
│       └── example-store.ts    # Exemplo de store
```

## Começando

### Instalação

```bash
npm install
```

### Configuração do Supabase

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Obtenha sua `ANON_KEY` do Supabase:
   - Acesse https://supabase.com/dashboard/project/ivqgfuxffqeebdtgoeyk/settings/api
   - Copie a chave `anon` / `public`
   - Cole no arquivo `.env.local`

3. Gere os tipos TypeScript do banco de dados:
```bash
npm run supabase:types
```

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build

```bash
npm run build
```

### Produção

```bash
npm start
```

## Recursos Configurados

### Autenticação (Google SSO)

O projeto utiliza Google OAuth através do Supabase Auth:

- ✅ Login com Google (SSO)
- ✅ Proteção de rotas com middleware
- ✅ Sessões persistentes e seguras
- ✅ Hooks personalizados para estado de auth

**Páginas:**
- [/login](src/app/login/page.tsx) - Tela de login com Google
- [/dashboard](src/app/dashboard/page.tsx) - Dashboard protegido
- [/auth/callback](src/app/auth/callback/route.ts) - Callback OAuth

**Componentes:**
- `<GoogleSignInButton />` - Botão de login
- `<SignOutButton />` - Botão de logout
- `useAuth()` - Hook para estado de autenticação

Para configurar a autenticação Google, veja [AUTHENTICATION.md](AUTHENTICATION.md)

### React Query

O provider do React Query está configurado em [src/providers/query-provider.tsx](src/providers/query-provider.tsx) com:
- Stale time de 1 minuto
- DevTools habilitados em desenvolvimento

### Zustand

Exemplo de store em [src/store/example-store.ts](src/store/example-store.ts) com:
- DevTools habilitados
- Persistência no localStorage

### React Hook Form + Zod

Schema de validação de exemplo em [src/lib/validations/example-schema.ts](src/lib/validations/example-schema.ts)

### Supabase

O projeto está conectado ao Supabase (ID: `ivqgfuxffqeebdtgoeyk`) com configuração completa:

#### Client Components
```typescript
import { supabase } from '@/lib/supabase/client';

// Exemplo de uso
const { data, error } = await supabase
  .from('events')
  .select('*');
```

#### Server Components
```typescript
import { createServerClient } from '@/lib/supabase/server';

// Exemplo de uso
const supabase = createServerClient();
const { data, error } = await supabase
  .from('events')
  .select('*');
```

#### Hooks React Query + Supabase
```typescript
import { useSupabaseQuery } from '@/lib/supabase';

// Exemplo de uso
const { data, isLoading } = useSupabaseQuery<Event>('events');
```

#### Tipos do Banco de Dados

Os tipos são gerados automaticamente do banco Supabase:
```typescript
import type { Database, Tables } from '@/lib/supabase/database.types';

// Usar tipos de tabelas
type Event = Tables<'events'>;
type Party = Tables<'parties'>;
```

Para atualizar os tipos após mudanças no banco:
```bash
npm run supabase:types
```

### shadcn/ui

Componentes podem ser adicionados com:

```bash
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add input
```

## Documentação Adicional

- 📖 [AUTHENTICATION.md](AUTHENTICATION.md) - Guia completo de autenticação Google SSO
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Guia de deploy na Vercel
- 📋 [Termos de Serviço](src/app/termos/page.tsx)
- 🔒 [Política de Privacidade](src/app/privacidade/page.tsx)

## Saiba Mais

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel Deployment](https://vercel.com/docs)
