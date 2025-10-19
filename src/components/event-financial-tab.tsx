"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calendar, FileText, Download, X } from "lucide-react";

interface EventFinancialTabProps {
  event: {
    event_contracts?: Array<{
      contract_number: string;
      contract_value: number | null;
      contract_date: string | null;
      notes: string | null;
      is_primary: boolean | null;
    }>;
    event_services?: Array<{
      id: string;
      quantity: number;
      unit_price: number | null;
      total_price: number | null;
      notes: string | null;
      products_services?: {
        description: string;
        item_type: string;
        service_type: string | null;
      };
    }>;
    molide_operations?: Array<{
      id: string;
      operation_type: "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION";
      operation_date: string;
      equipment_pcd: number | null;
      equipment_standard: number | null;
      status: string | null;
    }>;
    billing_frequency?: string;
    installment_count?: string;
    installment_value?: string;
    receipt_dates?: string[];
  };
  isEditing: boolean;
  isReadOnly: boolean;
  onDataChange: () => void;
}

export function EventFinancialTab({ event, isEditing, isReadOnly, onDataChange }: EventFinancialTabProps) {
  // Pegar o contrato principal (is_primary = true) ou o primeiro contrato
  const primaryContract = event.event_contracts?.find((contract) => contract.is_primary) || event.event_contracts?.[0];
  
  // Calcular valor total dos serviços
  const totalServicesValue = event.event_services?.reduce((total: number, service) => {
    return total + (service.total_price || 0);
  }, 0) || 0;
  
  const [formData, setFormData] = useState({
    contract_value: primaryContract?.contract_value || totalServicesValue || "",
    billing_frequency: event.billing_frequency || "",
    installment_count: event.installment_count || "",
    installment_value: event.installment_value || "",
  });

  const [receiptDates, setReceiptDates] = useState<string[]>(
    event.receipt_dates || []
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange();
  };

  const addReceiptDate = () => {
    setReceiptDates(prev => [...prev, ""]);
    onDataChange();
  };

  const removeReceiptDate = (index: number) => {
    setReceiptDates(prev => prev.filter((_, i) => i !== index));
    onDataChange();
  };

  const updateReceiptDate = (index: number, value: string) => {
    setReceiptDates(prev => prev.map((date, i) => i === index ? value : date));
    onDataChange();
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      {/* Valor do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Valor do Contrato</span>
          </CardTitle>
          <CardDescription>
            Informações financeiras do evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do Contrato */}
          {primaryContract ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informações do Contrato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Número do Contrato:</span>
                  <p className="text-blue-800">{primaryContract.contract_number}</p>
                </div>
                <div>
                  <span className="font-medium">Data do Contrato:</span>
                  <p className="text-blue-800">
                    {primaryContract.contract_date ? new Date(primaryContract.contract_date).toLocaleDateString("pt-BR") : "Não informada"}
                  </p>
                </div>
                {primaryContract.notes && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Observações:</span>
                    <p className="text-blue-800">{primaryContract.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Serviços Contratados */}
          {event.event_services && event.event_services.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">📋 Serviços Contratados</h4>
              <div className="space-y-3">
                {event.event_services.map((service, index: number) => (
                  <div key={service.id || index} className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Serviço:</span>
                        <p className="text-gray-900">{service.products_services?.description || "Serviço não especificado"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Quantidade:</span>
                        <p className="text-gray-900">{service.quantity}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Valor Unitário:</span>
                        <p className="text-gray-900">{formatCurrency(service.unit_price?.toString() || "0")}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total:</span>
                        <p className="text-green-800 font-semibold">{formatCurrency(service.total_price?.toString() || "0")}</p>
                      </div>
                    </div>
                    {service.notes && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700 text-sm">Observações:</span>
                        <p className="text-gray-600 text-sm">{service.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">Total dos Serviços:</span>
                    <span className="font-bold text-green-900 text-lg">{formatCurrency(totalServicesValue.toString())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operações Molide - Equipamentos */}
          {event.molide_operations && event.molide_operations.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-3">🚛 Operações Molide - Equipamentos</h4>
              <div className="space-y-3">
                {event.molide_operations.map((operation) => (
                  <div key={operation.id} className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Tipo de Operação:</span>
                        <p className="text-gray-900">
                          {operation.operation_type === "MOBILIZATION" && "Mobilização"}
                          {operation.operation_type === "CLEANING" && "Limpeza"}
                          {operation.operation_type === "DEMOBILIZATION" && "Desmobilização"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Data:</span>
                        <p className="text-gray-900">
                          {new Date(operation.operation_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Equip. PCD:</span>
                        <p className="text-orange-800 font-semibold">
                          {operation.equipment_pcd || 0} unidades
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Equip. Padrão:</span>
                        <p className="text-orange-800 font-semibold">
                          {operation.equipment_standard || 0} unidades
                        </p>
                      </div>
                    </div>
                    {operation.status && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700 text-sm">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          operation.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                          operation.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                          operation.status === "SCHEDULED" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {operation.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <span className="font-semibold text-orange-900">Total Equip. PCD:</span>
                      <p className="font-bold text-orange-900 text-lg">
                        {event.molide_operations.reduce((total, op) => total + (op.equipment_pcd || 0), 0)} unidades
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-orange-900">Total Equip. Padrão:</span>
                      <p className="font-bold text-orange-900 text-lg">
                        {event.molide_operations.reduce((total, op) => total + (op.equipment_standard || 0), 0)} unidades
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_value">Valor Total do Contrato</Label>
              <Input
                id="contract_value"
                type="number"
                step="0.01"
                value={formData.contract_value}
                onChange={(e) => handleInputChange("contract_value", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="0,00"
              />
              {formData.contract_value && (
                <p className="text-sm text-gray-600">
                  {formatCurrency(formData.contract_value.toString())}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_frequency">Frequência de Cobrança</Label>
              <Select
                value={formData.billing_frequency}
                onValueChange={(value) => handleInputChange("billing_frequency", value)}
                disabled={!isEditing || isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                  <SelectItem value="SEMIANNUAL">Semestral</SelectItem>
                  <SelectItem value="ANNUAL">Anual</SelectItem>
                  <SelectItem value="SINGLE">Única</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installment_count">Número de Parcelas</Label>
              <Input
                id="installment_count"
                type="number"
                value={formData.installment_count}
                onChange={(e) => handleInputChange("installment_count", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installment_value">Valor da Parcela</Label>
              <Input
                id="installment_value"
                type="number"
                step="0.01"
                value={formData.installment_value}
                onChange={(e) => handleInputChange("installment_value", e.target.value)}
                disabled={!isEditing || isReadOnly}
                placeholder="0,00"
              />
              {formData.installment_value && (
                <p className="text-sm text-gray-600">
                  {formatCurrency(formData.installment_value)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios e Fatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Relatórios e Fatura</span>
          </CardTitle>
          <CardDescription>
            Geração de relatórios e integração com Conta Azul
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              disabled={isReadOnly}
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              disabled={isReadOnly}
            >
              <Download className="h-4 w-4" />
              <span>XLSX</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              disabled={isReadOnly}
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Integração Conta Azul</Label>
            <Button
              className="w-full"
              disabled={isReadOnly}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Fatura no Conta Azul
            </Button>
            <p className="text-sm text-gray-600">
              Envia os dados financeiros para o Conta Azul para geração da fatura
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}