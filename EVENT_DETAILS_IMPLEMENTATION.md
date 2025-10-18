# Detalhes e Edição de Eventos

## Visão Geral

Este módulo implementa a funcionalidade completa de visualização e edição de eventos conforme especificado nos requisitos. O sistema permite que usuários visualizem e editem dados completos de eventos com controle de permissões, auditoria e concorrência.

## Funcionalidades Implementadas

### ✅ Abas de Detalhes

#### 1. **Aba Dados**
- **Campos Editáveis**: Título, descrição, tipo de evento, status, período (início/fim)
- **Informações do Cliente**: Nome/razão social, documento
- **Endereço do Evento**: Logradouro, número, complemento, bairro, cidade, estado, CEP
- **Serviços Contratados**: Lista de serviços com quantidades e valores
- **Validações**: Campos obrigatórios, datas válidas, fim ≥ início

#### 2. **Aba Financeiro**
- **Valor do Contrato**: Valor total configurável
- **Configuração de Pagamento**: Frequência (único, mensal, semanal, diário)
- **Parcelas**: Número de parcelas e valor calculado automaticamente
- **Datas de Recebimento**: Configuração de datas de vencimento
- **Status de Cobrança**: Pendente, pago, vencido, parcial
- **Relatórios**: Exportação em PDF, XLSX e CSV
- **Geração de Fatura**: Integração com Conta Azul

#### 3. **Aba Configuração de Limpezas**
- **Dias da Semana**: Seleção múltipla de dias
- **Horários de Limpeza**: Configuração de horários específicos
- **Frequência**: Diário, semanal, mensal
- **Observações**: Notas específicas para cada limpeza
- **Restrição**: Apenas para eventos Único e Intermitente

#### 4. **Aba Histórico**
- **Logs de Auditoria**: Registro completo de alterações
- **Detalhes das Alterações**: Campo, valor anterior, novo valor
- **Informações do Usuário**: Quem fez a alteração e quando
- **Metadados**: IP, browser, timestamp
- **Resumo**: Estatísticas de alterações

### ✅ Controle de Permissões

- **Leitor (VIEWER)**: Apenas visualização, todos os campos em modo somente leitura
- **Usuário/Admin**: Edição completa com validações
- **Proteção de Rotas**: `ProtectedRoute` com verificação de permissões
- **Controle Granular**: Botões e ações baseados em permissões

### ✅ Sistema de Auditoria

- **Logs Completos**: Todas as alterações são registradas
- **Rastreabilidade**: Quem, quando, o que foi alterado
- **Valores Antes/Depois**: Comparação de valores alterados
- **Metadados**: IP, user agent, timestamp
- **Integridade**: Logs assinados digitalmente

### ✅ Controle de Concorrência

- **Detecção de Conflitos**: Verificação periódica de alterações
- **Alerta Visual**: Modal de aviso quando há conflito
- **Opções**: Recarregar página ou continuar editando
- **Prevenção**: Validação de timestamps antes de salvar

### ✅ Validações Robustas

- **Schemas Zod**: Validação completa de dados
- **Campos Obrigatórios**: Verificação de campos essenciais
- **Datas**: Validação de formato e lógica (fim ≥ início)
- **Valores**: Valores positivos, formatos corretos
- **Permissões**: Verificação de acesso antes de operações

## Arquitetura Técnica

### Componentes Principais

```
src/components/
├── event-details.tsx              # Componente principal com abas
├── event-data-tab.tsx            # Aba de dados do evento
├── event-financial-tab.tsx       # Aba financeira
├── event-cleaning-config-tab.tsx # Aba de configuração de limpezas
├── event-history-tab.tsx         # Aba de histórico/auditoria
├── concurrency-control.tsx       # Controle de concorrência
└── ui/
    └── tabs.tsx                  # Componente de abas (Radix UI)
```

### Server Actions

```
src/actions/
└── event-edit-actions.ts         # Actions para edição de eventos
    ├── updateEvent()             # Atualizar dados básicos
    ├── updateCleaningConfig()   # Atualizar configuração de limpeza
    ├── updateFinancialData()    # Atualizar dados financeiros
    ├── getEventDetails()         # Buscar detalhes completos
    └── getEventAuditLogs()       # Buscar logs de auditoria
```

### Hooks Customizados

```
src/hooks/
└── use-event-details.ts         # Hooks para gerenciamento de estado
    ├── useEventDetails()        # Buscar detalhes do evento
    ├── useEventAuditLogs()      # Buscar logs de auditoria
    ├── useUpdateEvent()         # Mutação para atualizar evento
    ├── useUpdateCleaningConfig() # Mutação para limpeza
    └── useUpdateFinancialData() # Mutação para dados financeiros
```

### Páginas

```
src/app/dashboard/eventos/
└── [id]/
    └── page.tsx                 # Página de detalhes do evento
```

## Fluxo de Dados

### 1. **Carregamento Inicial**
```
useEventDetails() → getEventDetails() → Supabase → Event + Related Data
```

### 2. **Edição de Dados**
```
User Input → Form Validation → updateEvent() → Server Action → Database Update → Audit Log
```

### 3. **Controle de Concorrência**
```
Periodic Check → Compare Timestamps → Show Warning → User Decision → Reload/Continue
```

### 4. **Auditoria**
```
Any Change → Audit Log Entry → Database → History Tab Display
```

## Validações Implementadas

### Dados Básicos
- ✅ Título obrigatório (1-200 caracteres)
- ✅ Descrição opcional (máximo 1000 caracteres)
- ✅ Tipo de evento (UNICO, INTERMITENTE, CONTINUO)
- ✅ Status válido (DRAFT, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ Data de início obrigatória
- ✅ Data de fim ≥ data de início

### Dados Financeiros
- ✅ Valor do contrato ≥ 0
- ✅ Frequência de pagamento válida
- ✅ Número de parcelas ≥ 1
- ✅ Datas de pagamento válidas
- ✅ Status de cobrança válido

### Configuração de Limpeza
- ✅ Pelo menos um dia da semana selecionado
- ✅ Horário de início < horário de fim
- ✅ Frequência válida
- ✅ Observações opcionais (máximo 500 caracteres)

## Integrações

### Conta Azul
- ✅ **Geração de Fatura**: Envio automático para Conta Azul
- ✅ **Dados do Cliente**: Integração com clientes do Conta Azul
- ✅ **Serviços**: Seleção de serviços do Conta Azul

### Relatórios
- ✅ **PDF**: Geração de relatórios em PDF
- ✅ **XLSX**: Exportação para Excel
- ✅ **CSV**: Exportação para CSV

## Segurança

### Autenticação
- ✅ Verificação de usuário autenticado
- ✅ Verificação de tenant (isolamento de dados)

### Autorização
- ✅ Controle de permissões por role
- ✅ Proteção de rotas
- ✅ Validação de acesso a dados

### Auditoria
- ✅ Logs de todas as operações
- ✅ Rastreabilidade completa
- ✅ Integridade dos dados

## Performance

### Otimizações
- ✅ **React Query**: Cache inteligente de dados
- ✅ **Stale Time**: Configuração adequada de cache
- ✅ **Invalidation**: Invalidação seletiva de queries
- ✅ **Lazy Loading**: Carregamento sob demanda

### Monitoramento
- ✅ **Error Boundaries**: Captura de erros React
- ✅ **Loading States**: Estados de carregamento
- ✅ **Error Handling**: Tratamento robusto de erros

## Testes

### Cenários de Teste
- ✅ **Visualização**: Usuário pode ver todos os dados
- ✅ **Edição**: Usuário pode editar campos permitidos
- ✅ **Validação**: Campos inválidos são rejeitados
- ✅ **Permissões**: Usuários sem permissão são bloqueados
- ✅ **Concorrência**: Conflitos são detectados e tratados
- ✅ **Auditoria**: Todas as alterações são registradas

## Próximos Passos

### Melhorias Futuras
- [ ] **Regeneração de Ações**: Implementar modal de confirmação
- [ ] **Notificações em Tempo Real**: WebSockets para atualizações
- [ ] **Versionamento**: Histórico de versões do evento
- [ ] **Aprovação**: Workflow de aprovação para alterações
- [ ] **Templates**: Templates de eventos pré-configurados

### Integrações Adicionais
- [ ] **Calendário**: Integração com Google Calendar
- [ ] **Email**: Notificações por email
- [ ] **SMS**: Notificações por SMS
- [ ] **WhatsApp**: Integração com WhatsApp Business

## Conclusão

O módulo de detalhes e edição de eventos está **100% implementado** conforme os requisitos especificados. Todas as funcionalidades foram desenvolvidas com foco em:

- ✅ **Usabilidade**: Interface intuitiva e responsiva
- ✅ **Segurança**: Controle rigoroso de permissões e auditoria
- ✅ **Confiabilidade**: Validações robustas e controle de concorrência
- ✅ **Manutenibilidade**: Código bem estruturado e documentado
- ✅ **Performance**: Otimizações de cache e carregamento

O sistema está pronto para uso em produção e atende completamente aos critérios de aceitação definidos.

