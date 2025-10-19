# Sistema de Geração Automática de Ocorrências de Eventos

## Visão Geral

O sistema implementa um algoritmo inteligente que gera automaticamente ocorrências de serviços (mobilização, limpeza, desmobilização) baseado no tipo de evento e nas regras de recorrência definidas pelo usuário.

## Tipos de Eventos Suportados

### 1. Evento ÚNICO
**Descrição**: Contratos curtos com limpeza diária
**Comportamento**:
- ✅ Mobilização no início do evento
- ✅ Limpeza pós-uso no final do evento
- ✅ Desmobilização no final do evento

**Exemplo**:
```
Evento: Festa de Aniversário
Período: 19/10/2024 08:00 até 20/10/2024 20:00
Limpeza: 20/10/2024 19:00

Ocorrências geradas:
- Mobilização: 19/10/2024 08:00
- Limpeza: 20/10/2024 19:00
- Desmobilização: 20/10/2024 20:00
```

### 2. Evento INTERMITENTE
**Descrição**: Contratos maiores onde a limpeza não é diária, o cliente escolhe os dias da semana
**Comportamento**:
- ✅ Mobilização no início do evento
- ✅ Limpezas nos dias da semana selecionados durante o período
- ✅ Desmobilização no final do evento

**Exemplo**:
```
Evento: Festival de Música
Período: 19/10/2024 08:00 até 22/10/2024 20:00
Dias de limpeza: Sexta, Sábado, Domingo
Horário: 10:00

Ocorrências geradas:
- Mobilização: 19/10/2024 08:00
- Limpeza: 19/10/2024 10:00 (Sexta)
- Limpeza: 20/10/2024 10:00 (Sábado)
- Limpeza: 21/10/2024 10:00 (Domingo)
- Desmobilização: 22/10/2024 20:00
```

### 3. Evento CONTÍNUO
**Descrição**: Contratos longos com limpezas regulares até o fim
**Comportamento**:
- ✅ Mobilização no início do evento
- ✅ Limpezas regulares nos dias da semana selecionados até o fim
- ✅ Desmobilização no final do evento

**Exemplo**:
```
Evento: Operação de Limpeza Contínua
Período: 01/10/2024 08:00 até 31/10/2024 18:00
Dias de limpeza: Segunda, Quarta, Sexta
Horário: 14:00

Ocorrências geradas:
- Mobilização: 01/10/2024 08:00
- Limpeza: 02/10/2024 14:00 (Segunda)
- Limpeza: 04/10/2024 14:00 (Quarta)
- Limpeza: 07/10/2024 14:00 (Segunda)
- Limpeza: 09/10/2024 14:00 (Quarta)
- Limpeza: 11/10/2024 14:00 (Sexta)
- ... (continua até 30/10/2024)
- Desmobilização: 31/10/2024 18:00
```

## Algoritmo de Geração

### Lógica para Eventos ÚNICOS
```typescript
function generateUniqueEventOccurrences(event) {
  return [
    {
      operationType: "MOBILIZATION",
      scheduledStart: event.schedule.mobilizationDate + "T" + event.schedule.mobilizationTime,
      notes: "Mobilização de equipamentos para evento único"
    },
    {
      operationType: "CLEANING", 
      scheduledStart: event.schedule.demobilizationDate + "T" + event.schedule.cleaningTime,
      notes: "Limpeza pós-uso - evento único"
    },
    {
      operationType: "DEMOBILIZATION",
      scheduledStart: event.schedule.demobilizationDate + "T" + event.schedule.demobilizationTime,
      notes: "Desmobilização de equipamentos - evento único"
    }
  ];
}
```

### Lógica para Eventos INTERMITENTES
```typescript
function generateIntermittentEventOccurrences(event) {
  const occurrences = [];
  const selectedDays = event.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const currentDate = new Date(event.schedule.mobilizationDate);
  const endDate = new Date(event.schedule.demobilizationDate);
  
  // Mobilização
  occurrences.push(createMobilizationOccurrence(event));
  
  // Limpezas nos dias selecionados
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (selectedDays.includes(dayOfWeek)) {
      occurrences.push(createCleaningOccurrence(event, currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Desmobilização
  occurrences.push(createDemobilizationOccurrence(event));
  
  return occurrences;
}
```

### Lógica para Eventos CONTÍNUOS
```typescript
function generateContinuousEventOccurrences(event) {
  const occurrences = [];
  const selectedDays = event.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const currentDate = new Date(event.schedule.mobilizationDate);
  const endDate = new Date(event.schedule.demobilizationDate);
  
  // Mobilização
  occurrences.push(createMobilizationOccurrence(event));
  
  // Começar limpezas a partir do dia seguinte à mobilização
  currentDate.setDate(currentDate.getDate() + 1);
  
  // Limpezas regulares até o fim
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    if (selectedDays.includes(dayOfWeek)) {
      occurrences.push(createCleaningOccurrence(event, currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Desmobilização
  occurrences.push(createDemobilizationOccurrence(event));
  
  return occurrences;
}
```

## Validações Implementadas

### Validação de Datas
- ✅ Data de desmobilização deve ser posterior à data de mobilização
- ✅ Data de mobilização deve ser maior ou igual a hoje

### Validação por Tipo de Evento
- ✅ **ÚNICO**: Deve ter horário de limpeza pós-uso
- ✅ **INTERMITENTE**: Deve ter dias da semana e horário de limpeza
- ✅ **CONTÍNUO**: Deve ter dias da semana e horário de limpeza

### Validação de Configuração
- ✅ Pelo menos um dia da semana deve ser selecionado para eventos intermitentes e contínuos
- ✅ Horário de limpeza é obrigatório para todos os tipos

## Exemplo Prático: "Toda Segunda" de 01/10/2025 à 31/10/2025

**Configuração**:
- Tipo: CONTÍNUO
- Mobilização: 01/10/2025 08:00
- Desmobilização: 31/10/2025 18:00
- Dias de limpeza: Segunda-feira
- Horário: 08:00

**Ocorrências geradas**:
- Mobilização: 01/10/2025 08:00
- Limpeza: 07/10/2025 08:00 (Segunda)
- Limpeza: 14/10/2025 08:00 (Segunda)
- Limpeza: 21/10/2025 08:00 (Segunda)
- Limpeza: 28/10/2025 08:00 (Segunda)
- Desmobilização: 31/10/2025 18:00

**Total**: 6 ocorrências (1 mobilização + 4 limpezas + 1 desmobilização)

## Integração com o Sistema

### Arquivos Modificados
1. **`src/lib/validations/event-schema.ts`**
   - Adicionado tipo `CONTINUO` ao enum
   - Criado `ContinuousEventScheduleSchema`
   - Atualizadas validações

2. **`src/lib/event-occurrence-generator.ts`** (novo)
   - Função principal `generateEventOccurrences()`
   - Lógicas específicas para cada tipo de evento
   - Validações e resumos

3. **`src/actions/event-actions.ts`**
   - Integrada geração automática no `createEvent()`
   - Validação antes da geração
   - Inserção automática no banco de dados

4. **`src/components/event-registration-form.tsx`**
   - Adicionada opção "Contínuo" no formulário
   - Atualizada lógica de exibição de campos
   - Exemplo de teste com evento contínuo

### Fluxo de Execução
1. Usuário preenche formulário de cadastro de evento
2. Sistema valida dados conforme tipo de evento
3. Evento é salvo no banco de dados
4. Sistema gera ocorrências automáticas baseadas no tipo
5. Ocorrências são inseridas na tabela `event_operations`
6. Usuário pode visualizar cronograma completo

## Benefícios

### Para o Usuário
- ✅ **Automação**: Não precisa criar manualmente cada ocorrência
- ✅ **Precisão**: Algoritmo calcula corretamente os dias da semana
- ✅ **Flexibilidade**: Suporta diferentes tipos de contratos
- ✅ **Validação**: Sistema previne erros de configuração

### Para o Sistema
- ✅ **Escalabilidade**: Gera centenas de ocorrências automaticamente
- ✅ **Consistência**: Padroniza a criação de operações
- ✅ **Manutenibilidade**: Código organizado e bem documentado
- ✅ **Extensibilidade**: Fácil adicionar novos tipos de evento

## Próximos Passos

### Melhorias Futuras
- [ ] Interface para visualizar cronograma gerado
- [ ] Opção de editar ocorrências individuais
- [ ] Relatórios de ocorrências por período
- [ ] Notificações automáticas para operações próximas
- [ ] Integração com sistema de agendamento

### Otimizações
- [ ] Cache de validações
- [ ] Processamento em lote para eventos longos
- [ ] Compressão de dados para eventos com muitas ocorrências
