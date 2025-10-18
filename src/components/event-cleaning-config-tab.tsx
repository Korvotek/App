"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Settings, Clock, Calendar } from "lucide-react";

interface EventCleaningConfigTabProps {
  event: any;
  isEditing: boolean;
  isReadOnly: boolean;
  onDataChange: () => void;
}

export function EventCleaningConfigTab({ event, isEditing, isReadOnly, onDataChange }: EventCleaningConfigTabProps) {
  const [formData, setFormData] = useState({
    cleaning_start_time: event.cleaning_start_time || "",
    cleaning_end_time: event.cleaning_end_time || "",
    cleaning_frequency: event.cleaning_frequency || "",
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(
    event.cleaning_days || []
  );

  const weekDays = [
    { value: "monday", label: "Segunda-feira" },
    { value: "tuesday", label: "Terça-feira" },
    { value: "wednesday", label: "Quarta-feira" },
    { value: "thursday", label: "Quinta-feira" },
    { value: "friday", label: "Sexta-feira" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange();
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day];
      onDataChange();
      return newDays;
    });
  };

  // Só mostra esta aba para eventos Único ou Intermitente
  if (event.event_type !== "UNIQUE" && event.event_type !== "INTERMITTENT") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Configuração de limpezas disponível apenas para eventos do tipo:</p>
            <p className="font-medium">Único ou Intermitente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dias da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Dias da Semana</span>
          </CardTitle>
          <CardDescription>
            Selecione os dias da semana para realização das limpezas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekDays.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={selectedDays.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                  disabled={!isEditing || isReadOnly}
                />
                <Label htmlFor={day.value} className="text-sm font-medium">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horários de Limpeza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horários de Limpeza</span>
          </CardTitle>
          <CardDescription>
            Configure os horários de início e fim das limpezas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cleaning_start_time">Horário de Início</Label>
              <Input
                id="cleaning_start_time"
                type="time"
                value={formData.cleaning_start_time}
                onChange={(e) => handleInputChange("cleaning_start_time", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning_end_time">Horário de Fim</Label>
              <Input
                id="cleaning_end_time"
                type="time"
                value={formData.cleaning_end_time}
                onChange={(e) => handleInputChange("cleaning_end_time", e.target.value)}
                disabled={!isEditing || isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleaning_frequency">Frequência de Limpeza</Label>
            <Input
              id="cleaning_frequency"
              value={formData.cleaning_frequency}
              onChange={(e) => handleInputChange("cleaning_frequency", e.target.value)}
              disabled={!isEditing || isReadOnly}
              placeholder="Ex: Diária, Semanal, Quinzenal"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Resumo da Configuração</span>
          </CardTitle>
          <CardDescription>
            Visualização das configurações de limpeza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dias Selecionados:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedDays.length > 0 ? (
                selectedDays.map((day) => {
                  const dayLabel = weekDays.find(d => d.value === day)?.label;
                  return (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                    >
                      {dayLabel}
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-500 text-sm">Nenhum dia selecionado</span>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Horários:</Label>
            <div className="text-sm text-gray-600">
              {formData.cleaning_start_time && formData.cleaning_end_time ? (
                <p>
                  Das {formData.cleaning_start_time} às {formData.cleaning_end_time}
                </p>
              ) : (
                <p>Horários não configurados</p>
              )}
            </div>
          </div>

          {formData.cleaning_frequency && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Frequência:</Label>
                <p className="text-sm text-gray-600">{formData.cleaning_frequency}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}