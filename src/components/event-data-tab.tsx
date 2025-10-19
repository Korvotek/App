"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, RefreshCw } from "lucide-react";
import { getContaAzulCustomers } from "@/actions/event-actions";
import { toast } from "sonner";

interface ContaAzulCustomer {
  id: string;
  name?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
}

import type { Tables } from "@/lib/supabase/database.types";

interface EventDataTabProps {
  event: Tables<"events">;
  isEditing: boolean;
  isReadOnly: boolean;
  onDataChange: () => void;
}

export function EventDataTab({ event, isEditing, isReadOnly, onDataChange }: EventDataTabProps) {
  const [customers, setCustomers] = useState<ContaAzulCustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Formato para input datetime-local: YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    event_type: event.event_type || "",
    // Datas separadas
    mobilization_date: formatDateForInput(event.start_datetime || ""),
    mobilization_time: formatTimeForInput(event.start_datetime || ""),
    demobilization_date: formatDateForInput(event.end_datetime || ""),
    demobilization_time: formatTimeForInput(event.end_datetime || ""),
    // Cliente
    client_id: event.client_id || "",
    contract_number: event.event_number || "",
    // Endereço - será carregado separadamente
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    address_postal_code: "",
  });

  // Carregar clientes do Conta Azul
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const customersData = await getContaAzulCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Erro ao carregar clientes");
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    if (isEditing) {
      loadCustomers();
    }
  }, [isEditing]);

  // Atualizar formData quando o evento mudar
  useEffect(() => {
    setFormData({
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "",
      // Datas separadas
      mobilization_date: formatDateForInput(event.start_datetime || ""),
      mobilization_time: formatTimeForInput(event.start_datetime || ""),
      demobilization_date: formatDateForInput(event.end_datetime || ""),
      demobilization_time: formatTimeForInput(event.end_datetime || ""),
      // Cliente
      client_id: event.client_id || "",
      contract_number: event.event_number || "",
      // Endereço - será carregado separadamente
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
      address_postal_code: "",
    });
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
          <CardDescription>
            Dados principais do evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="Digite o título do evento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleInputChange("event_type", value)}
                disabled={!isEditing || isReadOnly}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={!isEditing || isReadOnly}
              placeholder="Descreva o evento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobilization_date">Data de Mobilização</Label>
              <Input
                id="mobilization_date"
                type="date"
                value={formData.mobilization_date}
                onChange={(e) => handleInputChange("mobilization_date", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobilization_time">Hora de Mobilização</Label>
              <Input
                id="mobilization_time"
                type="time"
                value={formData.mobilization_time}
                onChange={(e) => handleInputChange("mobilization_time", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demobilization_date">Data de Desmobilização</Label>
              <Input
                id="demobilization_date"
                type="date"
                value={formData.demobilization_date}
                onChange={(e) => handleInputChange("demobilization_date", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demobilization_time">Hora de Desmobilização</Label>
              <Input
                id="demobilization_time"
                type="time"
                value={formData.demobilization_time}
                onChange={(e) => handleInputChange("demobilization_time", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Dados do Cliente</span>
          </CardTitle>
          <CardDescription>
            Informações do cliente contratante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente do Conta Azul</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => handleInputChange("client_id", value)}
              disabled={!isEditing || isReadOnly || isLoadingCustomers}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCustomers ? "Carregando clientes..." : "Selecione um cliente do Conta Azul"} />
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
            <Label htmlFor="contract_number">Número do Contrato</Label>
            <Input
              id="contract_number"
              value={formData.contract_number}
              onChange={(e) => handleInputChange("contract_number", e.target.value)}
              disabled={!isEditing || isReadOnly}
              placeholder="Número do contrato"
            />
          </div>

          {/* Exibir dados do cliente selecionado */}
          {formData.client_id && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Dados do Cliente Selecionado:</h4>
              {(() => {
                const selectedCustomer = customers.find(c => c.id === formData.client_id);
                return selectedCustomer ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Nome:</strong> {selectedCustomer.name}</div>
                    <div><strong>Documento:</strong> {selectedCustomer.document}</div>
                    <div><strong>E-mail:</strong> {selectedCustomer.email || "Não informado"}</div>
                    <div><strong>Telefone:</strong> {selectedCustomer.phone || "Não informado"}</div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Cliente não encontrado</p>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Endereço do Evento</span>
          </CardTitle>
          <CardDescription>
            Local onde será realizado o evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address_street">Rua</Label>
              <Input
                id="address_street"
                value={formData.address_street}
                onChange={(e) => handleInputChange("address_street", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="Nome da rua"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_number">Número</Label>
              <Input
                id="address_number"
                value={formData.address_number}
                onChange={(e) => handleInputChange("address_number", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input
              id="address_complement"
              value={formData.address_complement}
              onChange={(e) => handleInputChange("address_complement", e.target.value)}
              disabled={!isEditing || isReadOnly}
              placeholder="Apartamento, sala, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_neighborhood">Bairro</Label>
              <Input
                id="address_neighborhood"
                value={formData.address_neighborhood}
                onChange={(e) => handleInputChange("address_neighborhood", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_city">Cidade</Label>
              <Input
                id="address_city"
                value={formData.address_city}
                onChange={(e) => handleInputChange("address_city", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="Nome da cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_state">Estado</Label>
              <Input
                id="address_state"
                value={formData.address_state}
                onChange={(e) => handleInputChange("address_state", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_postal_code">CEP</Label>
            <Input
              id="address_postal_code"
              value={formData.address_postal_code}
              onChange={(e) => handleInputChange("address_postal_code", e.target.value)}
              disabled={!isEditing || isReadOnly}
              placeholder="00000-000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Regras de Recorrência */}
      {event.event_type === "INTERMITENTE" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Regras de Recorrência</span>
            </CardTitle>
            <CardDescription>
              Configurações para eventos recorrentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {/* Aqui serão implementadas as regras de recorrência */}
              Regras de recorrência serão implementadas aqui
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}