import { type Event, type Weekday } from "@/lib/validations/event-schema";

export interface MolideAction {
  id: string;
  eventId: string;
  actionDate: string;
  actionTime: string;
  serviceType: "Mobilização" | "Limpeza" | "Desmobilização";
  vehicleType: "Carga" | "Tanque";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string;
  eventType: "UNICO" | "INTERMITENTE" | "CONTINUO";
  frequency?: "PROGRAMADA";
  createdAt: string;
}

const WEEKDAY_TO_NUMBER: Record<Weekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function calcularMobilizacaoEventoContinuo(evento: Event & { id: string }): MolideAction {
  const dataHoraInicio = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  
  return {
    id: `mob-${evento.id}-${Date.now()}`,
    eventId: evento.id,
    actionDate: dataHoraInicio.toISOString().split('T')[0],
    actionTime: dataHoraInicio.toTimeString().substring(0, 5),
    serviceType: "Mobilização",
    vehicleType: "Carga",
    status: "PENDING",
    notes: "Instalação inicial - Evento Contínuo",
    eventType: "CONTINUO",
    createdAt: new Date().toISOString(),
  };
}

function gerarLimpezasEventoContinuo(evento: Event & { id: string }): MolideAction[] {
  const limpezas: MolideAction[] = [];

  if (!("cleaningDays" in evento.schedule)) {
    return limpezas;
  }
  
  const diasSelecionados = evento.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const horarioLimpeza = evento.schedule.cleaningTime;
  
  const dataAtual = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  const dataFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  
  while (dataAtual <= dataFim) {
    const diaSemana = dataAtual.getDay();
    
    if (diasSelecionados.includes(diaSemana)) {
      const limpeza: MolideAction = {
        id: `lim-${evento.id}-${dataAtual.getTime()}`,
        eventId: evento.id,
        actionDate: dataAtual.toISOString().split('T')[0],
        actionTime: horarioLimpeza,
        serviceType: "Limpeza",
        vehicleType: "Tanque",
        status: "PENDING",
        notes: "Limpeza Programada - Evento Contínuo",
        eventType: "CONTINUO",
        frequency: "PROGRAMADA",
        createdAt: new Date().toISOString(),
      };
      limpezas.push(limpeza);
    }
    
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return limpezas;
}

function calcularDesmobilizacaoEventoContinuo(evento: Event & { id: string }): MolideAction {
  const dataHoraFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  
  return {
    id: `des-${evento.id}-${Date.now()}`,
    eventId: evento.id,
    actionDate: dataHoraFim.toISOString().split('T')[0],
    actionTime: dataHoraFim.toTimeString().substring(0, 5),
    serviceType: "Desmobilização",
    vehicleType: "Carga",
    status: "PENDING",
    notes: "Retirada final - Evento Contínuo",
    eventType: "CONTINUO",
    createdAt: new Date().toISOString(),
  };
}

function calcularMobilizacaoEventoUnico(evento: Event & { id: string }): MolideAction {
  const dataHoraInicio = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  
  return {
    id: `mob-${evento.id}-${Date.now()}`,
    eventId: evento.id,
    actionDate: dataHoraInicio.toISOString().split('T')[0],
    actionTime: dataHoraInicio.toTimeString().substring(0, 5),
    serviceType: "Mobilização",
    vehicleType: "Carga",
    status: "PENDING",
    notes: "Instalação inicial - Evento Único",
    eventType: "UNICO",
    createdAt: new Date().toISOString(),
  };
}

function gerarLimpezaEventoUnico(evento: Event & { id: string }): MolideAction {
  if (!("cleaningTime" in evento.schedule)) {
    throw new Error("Evento único deve ter cleaningTime");
  }
  
  const dataHoraLimpeza = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.cleaningTime}`);
  
  return {
    id: `lim-${evento.id}-${Date.now()}`,
    eventId: evento.id,
    actionDate: dataHoraLimpeza.toISOString().split('T')[0],
    actionTime: dataHoraLimpeza.toTimeString().substring(0, 5),
    serviceType: "Limpeza",
    vehicleType: "Tanque",
    status: "PENDING",
    notes: "Limpeza Pós Uso - Evento Único",
    eventType: "UNICO",
    createdAt: new Date().toISOString(),
  };
}

function calcularDesmobilizacaoEventoUnico(evento: Event & { id: string }): MolideAction {
  const dataHoraFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  
  return {
    id: `des-${evento.id}-${Date.now()}`,
    eventId: evento.id,
    actionDate: dataHoraFim.toISOString().split('T')[0],
    actionTime: dataHoraFim.toTimeString().substring(0, 5),
    serviceType: "Desmobilização",
    vehicleType: "Carga",
    status: "PENDING",
    notes: "Retirada final - Evento Único",
    eventType: "UNICO",
    createdAt: new Date().toISOString(),
  };
}

function gerarLimpezasEventoIntermittente(evento: Event & { id: string }): MolideAction[] {
  const limpezas: MolideAction[] = [];

  if (!("cleaningDays" in evento.schedule)) {
    return limpezas;
  }
  
  const diasSelecionados = evento.schedule.cleaningDays.map(day => WEEKDAY_TO_NUMBER[day]);
  const horarioLimpeza = evento.schedule.cleaningTime;
  
  const dataAtual = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  const dataFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  
  while (dataAtual <= dataFim) {
    const diaSemana = dataAtual.getDay();
    
    if (diasSelecionados.includes(diaSemana)) {
      const limpeza: MolideAction = {
        id: `lim-${evento.id}-${dataAtual.getTime()}`,
        eventId: evento.id,
        actionDate: dataAtual.toISOString().split('T')[0],
        actionTime: horarioLimpeza,
        serviceType: "Limpeza",
        vehicleType: "Tanque",
        status: "PENDING",
        notes: "Limpeza Programada - Evento Intermitente",
        eventType: "INTERMITENTE",
        frequency: "PROGRAMADA",
        createdAt: new Date().toISOString(),
      };
      limpezas.push(limpeza);
    }
    
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return limpezas;
}

export function calcularMOLIDEEvento(evento: Event & { id: string }): MolideAction[] {
  const acoes: MolideAction[] = [];

  if (!validarEvento(evento)) {
    throw new Error('Configuração de evento inválida');
  }

  if (evento.eventType === "UNICO") {
    acoes.push(calcularMobilizacaoEventoUnico(evento));
    acoes.push(gerarLimpezaEventoUnico(evento));
    acoes.push(calcularDesmobilizacaoEventoUnico(evento));
  } else if (evento.eventType === "INTERMITENTE") {
    acoes.push(calcularMobilizacaoEventoContinuo(evento));
    acoes.push(...gerarLimpezasEventoIntermittente(evento));
    acoes.push(calcularDesmobilizacaoEventoContinuo(evento));
  } else if (evento.eventType === "CONTINUO") {
    acoes.push(calcularMobilizacaoEventoContinuo(evento));
    acoes.push(...gerarLimpezasEventoContinuo(evento));
    acoes.push(calcularDesmobilizacaoEventoContinuo(evento));
  }

  return acoes.sort((a, b) =>
    new Date(a.actionDate + ' ' + a.actionTime).getTime() -
    new Date(b.actionDate + ' ' + b.actionTime).getTime()
  );
}

function validarEvento(evento: Event & { id: string }): boolean {
  const erros: string[] = [];

  if (!evento.schedule.mobilizationDate || !evento.schedule.mobilizationTime ||
      !evento.schedule.demobilizationDate || !evento.schedule.demobilizationTime) {
    erros.push('Datas de mobilização e desmobilização são obrigatórias');
  }
  
  const dataInicio = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  const dataFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  
  if (dataFim <= dataInicio) {
    erros.push('Data de desmobilização deve ser posterior à data de mobilização');
  }

  if (evento.eventType === "INTERMITENTE") {
    const duracao = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24);
    if (duracao < 1) {
      erros.push('Eventos intermitentes devem ter duração mínima de 1 dia');
    }
  }

  if (evento.eventType === "INTERMITENTE") {
    if (!("cleaningDays" in evento.schedule) || !evento.schedule.cleaningDays || evento.schedule.cleaningDays.length === 0) {
      erros.push('Pelo menos um dia da semana deve ser selecionado para limpeza');
    }
    if (!("cleaningTime" in evento.schedule) || !evento.schedule.cleaningTime) {
      erros.push('Horário de limpeza é obrigatório');
    }
  }

  if (evento.eventType === "UNICO") {
    if (!("cleaningDateTime" in evento.schedule) || !evento.schedule.cleaningDateTime) {
      erros.push('Horário de limpeza pós uso é obrigatório');
    }
  }
  
  return erros.length === 0;
}

export function gerarResumoEstatistico(evento: Event & { id: string }, acoes: MolideAction[]) {
  const dataInicio = new Date(`${evento.schedule.mobilizationDate}T${evento.schedule.mobilizationTime}`);
  const dataFim = new Date(`${evento.schedule.demobilizationDate}T${evento.schedule.demobilizationTime}`);
  const duracao = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
  
  const mobilizacoes = acoes.filter(a => a.serviceType === "Mobilização").length;
  const limpezas = acoes.filter(a => a.serviceType === "Limpeza").length;
  const desmobilizacoes = acoes.filter(a => a.serviceType === "Desmobilização").length;
  
  return {
    duracao,
    totalAcoes: acoes.length,
    mobilizacoes,
    limpezas,
    desmobilizacoes,
    tipoEvento: evento.eventType,
    frequenciaLimpeza: evento.eventType === "INTERMITENTE"
      ? ("cleaningDays" in evento.schedule ? `${evento.schedule.cleaningDays.length}x por semana` : "N/A")
      : "1x (pós uso)",
  };
}

export function formatarCronograma(acoes: MolideAction[]) {
  return acoes.map(acao => ({
    data: new Date(acao.actionDate).toLocaleDateString("pt-BR"),
    horario: acao.actionTime,
    servico: acao.serviceType,
    veiculo: acao.vehicleType,
    observacao: acao.notes,
    status: acao.status,
  }));
}
