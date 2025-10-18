"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createEvent, getContaAzulServices, getContaAzulCustomers } from "@/actions/event-actions";
import { calcularMOLIDEEvento, gerarResumoEstatistico } from "@/lib/molide/event-calculator";
import { EventFormSchema, type EventForm } from "@/lib/validations/event-schema";

interface ContaAzulService {
  id: string;
  code?: string | null;
  description?: string | null;
  cost?: number | null;
  price?: number | null;
  external_code?: string | null;
}

interface ContaAzulCustomer {
  id: string;
  name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
}

interface EventService {
  serviceId: string;
  serviceName: string;
  dailyValue: number;
  quantity: number;
  days: number;
  totalValue: number;
  observations: string;
}

export function EventRegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<ContaAzulService[]>([]);
  const [customers, setCustomers] = useState<ContaAzulCustomer[]>([]);
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    contract_number: "",
    event_type: "",
    mobilization_date: "",
    mobilization_time: "",
    demobilization_date: "",
    demobilization_time: "",
    cleaning_time: "",
    cleaning_days: [] as string[],
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    address_postal_code: "",
  });

  // Carregar serviços e clientes do Conta Azul
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, customersData] = await Promise.all([
          getContaAzulServices(),
          getContaAzulCustomers()
        ]);
        setServices(servicesData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar serviços e clientes");
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      client_id: customerId,
    }));
  };

  const addService = () => {
    if (services.length > 0) {
      const firstService = services[0];
      const mobilizationDate = new Date(`${formData.mobilization_date}T${formData.mobilization_time}`);
      const demobilizationDate = new Date(`${formData.demobilization_date}T${formData.demobilization_time}`);
      const days = Math.ceil((demobilizationDate.getTime() - mobilizationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const newService: EventService = {
        serviceId: firstService.id,
        serviceName: firstService.description || "Serviço",
        dailyValue: firstService.price || 0,
        quantity: 1,
        days: days || 1,
        totalValue: (firstService.price || 0) * (days || 1),
        observations: "",
      };
      setEventServices(prev => [...prev, newService]);
    }
  };

  const removeService = (index: number) => {
    setEventServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof EventService, value: string | number) => {
    setEventServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updatedService = { ...service, [field]: value };
        
        // Recalcular valor total quando dailyValue, quantity ou days mudarem
        if (field === 'dailyValue' || field === 'quantity' || field === 'days') {
          updatedService.totalValue = Number(updatedService.dailyValue) * Number(updatedService.quantity) * Number(updatedService.days);
        }
        
        return updatedService;
      }
      return service;
    }));
  };

  const fillTestData = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    setFormData({
      title: "Evento de Teste - Festa de Aniversário",
      description: "Evento de teste para demonstração do sistema",
      client_id: customers.length > 0 ? customers[0].id : "",
      contract_number: `CONTRATO-${Date.now()}`,
      event_type: "UNICO",
      mobilization_date: tomorrow.toISOString().split('T')[0],
      mobilization_time: "08:00",
      demobilization_date: dayAfterTomorrow.toISOString().split('T')[0],
      demobilization_time: "20:00",
      cleaning_time: "19:00",
      cleaning_days: ["FRIDAY", "SATURDAY", "SUNDAY"],
      address_street: "Rua das Flores",
      address_number: "123",
      address_complement: "Sala 101",
      address_neighborhood: "Centro",
      address_city: "São Paulo",
      address_state: "SP",
      address_postal_code: "01234-567",
    });

    // Adicionar um serviço de teste se houver serviços disponíveis
    if (services.length > 0) {
      const testService = services.find(s => s.description?.includes("LOCAÇÃO")) || services[0];
      const mobilizationDate = new Date(tomorrow);
      const demobilizationDate = new Date(dayAfterTomorrow);
      const days = Math.ceil((demobilizationDate.getTime() - mobilizationDate.getTime()) / (1000 * 60 * 60 * 24));

      const testEventService: EventService = {
        serviceId: testService.id,
        serviceName: testService.description || "Serviço de Teste",
        dailyValue: testService.price || 150,
        quantity: 2,
        days: days || 1,
        totalValue: (testService.price || 150) * 2 * (days || 1),
        observations: "Serviço de teste para demonstração",
      };

      setEventServices([testEventService]);
    }

    toast.success("Dados de teste preenchidos!");
  };

  const calculateMolideServices = () => {
    if (!formData.mobilization_date || !formData.mobilization_time || !formData.demobilization_date || !formData.demobilization_time || !formData.event_type) {
      toast.error("Preencha as datas e tipo de evento antes de calcular serviços");
      return;
    }

    try {
      const startDate = new Date(`${formData.mobilization_date}T${formData.mobilization_time}`);
      const endDate = new Date(`${formData.demobilization_date}T${formData.demobilization_time}`);

      const eventData = {
        id: "temp-" + Date.now(),
        title: formData.title,
        description: formData.description,
        customerId: formData.client_id,
        customerName: "Cliente Selecionado",
        customerDocument: "123456789",
        contractNumber: `EVT-${Date.now()}`,
        eventType: formData.event_type as "UNICO" | "INTERMITENTE",
        address: {
          street: formData.address_street,
          number: formData.address_number,
          complement: formData.address_complement,
          neighborhood: formData.address_neighborhood,
          city: formData.address_city,
          state: formData.address_state,
          zipCode: formData.address_postal_code,
        },
        services: [],
        schedule: formData.event_type === "INTERMITENTE" ? {
          mobilizationDate: startDate.toISOString().split('T')[0],
          mobilizationTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
          demobilizationDate: endDate.toISOString().split('T')[0],
          demobilizationTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
          cleaningDays: formData.cleaning_days as ("MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY")[],
          cleaningTime: formData.cleaning_time,
        } : {
          mobilizationDate: startDate.toISOString().split('T')[0],
          mobilizationTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
          demobilizationDate: endDate.toISOString().split('T')[0],
          demobilizationTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
          cleaningTime: formData.cleaning_time,
        },
      };

      const molideActions = calcularMOLIDEEvento(eventData);
      const resumo = gerarResumoEstatistico(eventData, molideActions);

      toast.success(`Calculados ${resumo.totalAcoes} serviços: ${resumo.mobilizacoes} mobilizações, ${resumo.limpezas} limpezas, ${resumo.desmobilizacoes} desmobilizações`);

      // Converter ações MOLIDE para serviços do evento
      const calculatedServices: EventService[] = molideActions.map((action, index) => ({
        serviceId: services[0]?.id || "default",
        serviceName: `${action.serviceType} - ${action.vehicleType}`,
        dailyValue: action.serviceType === "Limpeza" ? 150 : 200, // Valores padrão
        quantity: 1,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalValue: (action.serviceType === "Limpeza" ? 150 : 200) * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        observations: "",
      }));

      setEventServices(calculatedServices);
    } catch (error) {
      console.error("Erro ao calcular serviços:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao calcular serviços");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setValidationErrors({});
      
      console.log("🚀 Iniciando criação do evento...");
      
      // Validar dados do formulário com Zod
      const validationResult = EventFormSchema.safeParse(formData);
      
      if (!validationResult.success) {
        console.log("❌ Erros de validação:", validationResult.error.issues);
        
        // Mapear erros do Zod para o estado de erros
        const errors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        
        setValidationErrors(errors);
        
        // Mostrar primeiro erro como toast
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        
        return;
      }
      
      console.log("✅ Validação Zod passou!");
      
      // Buscar dados do cliente selecionado
      const selectedCustomer = customers.find(c => c.id === formData.client_id);
      if (!selectedCustomer) {
        throw new Error("Cliente não selecionado");
      }

      console.log("📋 Dados do evento a serem salvos:");
      console.log("  - Título:", formData.title);
      console.log("  - Tipo:", formData.event_type);
      console.log("  - Cliente:", selectedCustomer.name, "(", selectedCustomer.document, ")");
      console.log("  - Contrato:", formData.contract_number);
      console.log("  - Endereço:", formData.address_street, formData.address_number, formData.address_city);
      console.log("  - Serviços:", eventServices.length, "serviço(s)");

      // Criar FormData com os dados do formulário
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("description", formData.description || "");
      formDataToSubmit.append("eventType", formData.event_type);
      formDataToSubmit.append("customerId", formData.client_id);
      formDataToSubmit.append("customerName", selectedCustomer.name || "");
      formDataToSubmit.append("customerDocument", selectedCustomer.document || "");
      formDataToSubmit.append("contractNumber", formData.contract_number);
      formDataToSubmit.append("address.street", formData.address_street);
      formDataToSubmit.append("address.number", formData.address_number);
      formDataToSubmit.append("address.complement", formData.address_complement || "");
      formDataToSubmit.append("address.neighborhood", formData.address_neighborhood);
      formDataToSubmit.append("address.city", formData.address_city);
      formDataToSubmit.append("address.state", formData.address_state);
      formDataToSubmit.append("address.zipCode", formData.address_postal_code);
      
      // Configurar datas de mobilização e desmobilização
      const startDate = new Date(`${formData.mobilization_date}T${formData.mobilization_time}`);
      const endDate = new Date(`${formData.demobilization_date}T${formData.demobilization_time}`);
      
      const schedule = {
        mobilizationDate: startDate.toISOString().split('T')[0],
        mobilizationTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
        demobilizationDate: endDate.toISOString().split('T')[0],
        demobilizationTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
        cleaningTime: formData.cleaning_time,
        ...(formData.event_type === "INTERMITENTE" && { cleaningDays: formData.cleaning_days }),
      };
      
      formDataToSubmit.append("schedule", JSON.stringify(schedule));
      formDataToSubmit.append("services", JSON.stringify(eventServices));

      console.log("💾 Chamando createEvent() - Será salvo nas seguintes tabelas:");
      console.log("  📊 events - Dados principais do evento");
      console.log("  📊 event_locations - Endereço do evento");
      console.log("  📊 event_services - Serviços vinculados ao evento");
      console.log("  📊 products_services - Serviços (se não existirem)");
      console.log("  📊 activity_logs - Log de auditoria");
      
      await createEvent(formDataToSubmit);
      
      console.log("✅ Evento criado com sucesso!");
      // Se chegou aqui, o evento foi criado com sucesso
      // A função createEvent faz redirect automaticamente
      
    } catch (error) {
      console.error("❌ Erro ao cadastrar evento:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar evento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cadastrar Evento</h1>
            <p className="text-muted-foreground text-sm">
              Preencha os dados do novo evento
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillTestData}
            disabled={customers.length === 0 || services.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Preencher Dados de Teste
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais do evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Digite o título do evento"
                required
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o evento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_select">Cliente: Razão Social, CNPJ *</Label>
              <Select
                value={formData.client_id}
                onValueChange={handleCustomerChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente do Conta Azul" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.document}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_number">Número do Contrato *</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => handleInputChange("contract_number", e.target.value)}
                placeholder="Digite o número do contrato"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo do Evento *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleInputChange("event_type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNICO">Único</SelectItem>
                  <SelectItem value="INTERMITENTE">Intermitente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Programação */}
        <Card>
          <CardHeader>
            <CardTitle>Programação</CardTitle>
            <CardDescription>
              Configure as datas e horários do evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobilization_date">Data de Mobilização *</Label>
                <Input
                  id="mobilization_date"
                  type="date"
                  value={formData.mobilization_date}
                  onChange={(e) => handleInputChange("mobilization_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobilization_time">Hora de Mobilização *</Label>
                <Input
                  id="mobilization_time"
                  type="time"
                  value={formData.mobilization_time}
                  onChange={(e) => handleInputChange("mobilization_time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demobilization_date">Data de Desmobilização *</Label>
                <Input
                  id="demobilization_date"
                  type="date"
                  value={formData.demobilization_date}
                  onChange={(e) => handleInputChange("demobilization_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demobilization_time">Hora de Desmobilização *</Label>
                <Input
                  id="demobilization_time"
                  type="time"
                  value={formData.demobilization_time}
                  onChange={(e) => handleInputChange("demobilization_time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaning_time">Horário de Limpeza Pós Uso *</Label>
              <Input
                id="cleaning_time"
                type="time"
                value={formData.cleaning_time}
                onChange={(e) => handleInputChange("cleaning_time", e.target.value)}
                required
              />
            </div>

            {formData.event_type === "INTERMITENTE" && (
              <div className="space-y-2">
                <Label>Dias da Semana - Limpeza *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: "MONDAY", label: "Segunda" },
                    { value: "TUESDAY", label: "Terça" },
                    { value: "WEDNESDAY", label: "Quarta" },
                    { value: "THURSDAY", label: "Quinta" },
                    { value: "FRIDAY", label: "Sexta" },
                    { value: "SATURDAY", label: "Sábado" },
                    { value: "SUNDAY", label: "Domingo" },
                  ].map((day) => (
                    <label key={day.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.cleaning_days.includes(day.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              cleaning_days: [...prev.cleaning_days, day.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              cleaning_days: prev.cleaning_days.filter(d => d !== day.value)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
            <CardDescription>
              Adicione os serviços de locação para este evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Serviços de Locação</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={calculateMolideServices}
                  disabled={!formData.mobilization_date || !formData.mobilization_time || !formData.demobilization_date || !formData.demobilization_time || !formData.event_type || !formData.cleaning_time}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Calcular Automático
                </Button>
              </div>
            </div>

            {eventServices.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Serviço {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Buscar Serviço *</Label>
                    <Select
                      value={service.serviceId}
                      onValueChange={(value) => {
                        const selectedService = services.find(s => s.id === value);
                        if (selectedService) {
                          updateService(index, "serviceId", value);
                          updateService(index, "serviceName", selectedService.description || "");
                          updateService(index, "dailyValue", selectedService.price || 0);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.filter(s => s.description?.includes("LOCAÇÃO")).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Diária *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={service.dailyValue}
                      onChange={(e) => updateService(index, "dailyValue", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Diárias *</Label>
                    <Input
                      type="number"
                      value={service.days}
                      onChange={(e) => updateService(index, "days", parseInt(e.target.value) || 1)}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => updateService(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={service.observations}
                      onChange={(e) => updateService(index, "observations", e.target.value)}
                      placeholder="Observações opcionais"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={service.totalValue}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}

            {eventServices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum serviço selecionado</p>
                <p className="text-sm">Clique em "Adicionar Serviço" para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço do Evento</CardTitle>
            <CardDescription>
              Local onde será realizado o evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address_street">Rua *</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => handleInputChange("address_street", e.target.value)}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_number">Número *</Label>
                <Input
                  id="address_number"
                  value={formData.address_number}
                  onChange={(e) => handleInputChange("address_number", e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_complement">Complemento</Label>
              <Input
                id="address_complement"
                value={formData.address_complement}
                onChange={(e) => handleInputChange("address_complement", e.target.value)}
                placeholder="Apartamento, sala, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro *</Label>
                <Input
                  id="address_neighborhood"
                  value={formData.address_neighborhood}
                  onChange={(e) => handleInputChange("address_neighborhood", e.target.value)}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Cidade *</Label>
                <Input
                  id="address_city"
                  value={formData.address_city}
                  onChange={(e) => handleInputChange("address_city", e.target.value)}
                  placeholder="Nome da cidade"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_state">Estado *</Label>
                <Input
                  id="address_state"
                  value={formData.address_state}
                  onChange={(e) => handleInputChange("address_state", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_postal_code">CEP *</Label>
              <Input
                id="address_postal_code"
                value={formData.address_postal_code}
                onChange={(e) => handleInputChange("address_postal_code", e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Evento"}
          </Button>
        </div>
      </form>
    </div>
  );
}