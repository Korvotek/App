"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateOperation } from "@/hooks/use-operations";
import { useEventsForOperations, useDrivers, useVehicles } from "@/hooks/use-operations";
import { Calendar, Clock, Save, X } from "lucide-react";

const OperationSchema = z.object({
  event_id: z.string().min(1, "Evento é obrigatório"),
  operation_type: z.string().min(1, "Tipo de operação é obrigatório"),
  scheduled_start: z.string().min(1, "Data/hora de início é obrigatória"),
  scheduled_end: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  notes: z.string().optional(),
});

type OperationForm = z.infer<typeof OperationSchema>;

export function OperationRegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const createOperationMutation = useCreateOperation();
  const { data: events = [] } = useEventsForOperations();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();

  const form = useForm<OperationForm>({
    resolver: zodResolver(OperationSchema),
    defaultValues: {
      status: "PENDING",
    },
  });

  const onSubmit = async (data: OperationForm) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("event_id", data.event_id);
      formData.append("operation_type", data.operation_type);
      formData.append("scheduled_start", data.scheduled_start);
      if (data.scheduled_end) {
        formData.append("scheduled_end", data.scheduled_end);
      }
      formData.append("status", data.status);
      if (data.driver_id) {
        formData.append("driver_id", data.driver_id);
      }
      if (data.vehicle_id) {
        formData.append("vehicle_id", data.vehicle_id);
      }
      if (data.notes) {
        formData.append("notes", data.notes);
      }

      await createOperationMutation.mutateAsync(formData);
      
      toast.success("Operação criada com sucesso!");
      router.push("/dashboard/operacoes");
    } catch (error) {
      toast.error("Erro ao criar operação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/operacoes");
  };

  const fillTestData = () => {
    if (events.length > 0) {
      form.setValue("event_id", events[0].id);
    }
    form.setValue("operation_type", "MOBILIZATION");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDateTime = tomorrow.toISOString().slice(0, 16);
    form.setValue("scheduled_start", startDateTime);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const endDateTime = dayAfterTomorrow.toISOString().slice(0, 16);
    form.setValue("scheduled_end", endDateTime);
    
    form.setValue("status", "SCHEDULED");
    
    if (drivers.length > 0) {
      form.setValue("driver_id", drivers[0].id);
    }
    
    if (vehicles.length > 0) {
      form.setValue("vehicle_id", vehicles[0].id);
    }
    
    form.setValue("notes", "Operação de teste - mobilização de equipamentos");
    
    toast.success("Formulário preenchido com dados de teste!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cadastrar Operação</h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <FormField
            control={form.control}
            name="event_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evento *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - #{event.event_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="operation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Operação *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de operação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MOBILIZATION">Mobilização</SelectItem>
                    <SelectItem value="CLEANING">Limpeza</SelectItem>
                    <SelectItem value="DEMOBILIZATION">Desmobilização</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="scheduled_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data/Hora de Início *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="datetime-local"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="scheduled_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data/Hora de Fim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="datetime-local"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="SCHEDULED">Agendado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="driver_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motorista</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações sobre a operação..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={fillTestData}
              disabled={isLoading}
            >
              🔧 Preencher para Teste
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Operação
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
