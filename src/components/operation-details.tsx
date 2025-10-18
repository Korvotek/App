"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  MapPin,
  ArrowLeft,
  Save,
  AlertCircle
} from "lucide-react";
import { useOperations, useDrivers, useWorkers } from "@/hooks/use-operations";
import type { OperationWithRelations } from "@/actions/operations-actions";
import { GoogleMap } from "@/components/ui/google-map-simple";
import { StaticMap } from "@/components/ui/static-map";
import { useGeocode } from "@/hooks/use-geocode";
import { testGoogleMapsAPI } from "@/lib/test-google-maps";
import { toast } from "sonner";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const operationTypeLabels = {
  MOBILIZATION: "Mobilização",
  CLEANING: "Limpeza",
  DEMOBILIZATION: "Desmobilização",
};

export function OperationDetails() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  const [selectedDriver, setSelectedDriver] = useState<string>("none");
  const [selectedWorker, setSelectedWorker] = useState<string>("none");
  const [isUpdating, setIsUpdating] = useState(false);
  const [useStaticMap, setUseStaticMap] = useState(false);

  const { data: operationData, isLoading } = useOperations({
    page: 1,
    limit: 1,
    operationId: operationId,
  });

  console.log("OperationDetails - operationId:", operationId);
  console.log("OperationDetails - operationData:", operationData);
  console.log("OperationDetails - isLoading:", isLoading);

  const { data: drivers } = useDrivers();
  const { data: workers } = useWorkers();

  const operation: OperationWithRelations | undefined = operationData?.operations?.[0];

  const fullAddress = (() => {
    const location = operation?.events?.event_locations?.[0];
    if (!location) return "Endereço não informado";
    
    // Construir endereço de forma mais compatível com Google Maps
    const addressParts = [];
    
    if (location.street && location.number) {
      addressParts.push(`${location.street}, ${location.number}`);
    } else if (location.street) {
      addressParts.push(location.street);
    }
    
    if (location.neighborhood) {
      addressParts.push(location.neighborhood);
    }
    
    if (location.city) {
      addressParts.push(location.city);
    }
    
    if (location.state) {
      addressParts.push(location.state);
    }
    
    if (location.postal_code) {
      addressParts.push(location.postal_code);
    }
    
    return addressParts.length > 0 ? addressParts.join(", ") : "Endereço não informado";
  })();

  console.log("Endereço construído:", fullAddress);

  const { result: geocodeResult } = useGeocode(fullAddress);

  useEffect(() => {
    if (operation) {
      setSelectedDriver(operation.driver_id || "none");
      setSelectedWorker("none"); // Não há worker_id na tabela event_operations
    }
  }, [operation]);

  useEffect(() => {
    // Testar API do Google Maps quando o componente carregar
    const testAPI = async () => {
      const result = await testGoogleMapsAPI();
      console.log("Resultado do teste da API:", result);
    };
    testAPI();
  }, []);

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("pt-BR");
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveAssignments = async () => {
    if (!operation) return;

    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Atribuições salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar atribuições");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Operação não encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          A operação solicitada não foi encontrada ou ocorreu um erro ao carregá-la.
        </p>
        <div className="mt-6">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {operationTypeLabels[operation.operation_type as keyof typeof operationTypeLabels] || operation.operation_type}
            </h1>
            <p className="text-muted-foreground">
              #{operation.events?.event_number || "N/A"}
            </p>
          </div>
        </div>
        <Badge 
          className={statusColors[operation.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
        >
          {operation.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalhes da Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data</Label>
                  <p className="text-sm">{formatDate(operation.scheduled_start)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Horário</Label>
                  <p className="text-sm">
                    {formatTime(operation.scheduled_start)}
                    {operation.scheduled_end && (
                      <> - {formatTime(operation.scheduled_end)}</>
                    )}
                  </p>
                </div>
              </div>

              {operation.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                  <p className="text-sm">{operation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                <p className="text-sm font-medium">{operation.events?.title || "N/A"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                <p className="text-sm">{fullAddress}</p>
              </div>

              
              {operation.events?.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descri��o</Label>
                  <p className="text-sm">{operation.events.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Atribuições
              </CardTitle>
              <CardDescription>
                Selecione o motorista e funcionário para esta operação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="driver">Motorista</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum motorista</SelectItem>
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              
              <div className="space-y-2">
                <Label htmlFor="worker">Funcionário</Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum funcionário</SelectItem>
                    {workers?.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button 
                onClick={handleSaveAssignments}
                disabled={isUpdating}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Salvando..." : "Salvar Atribuições"}
              </Button>
            </CardContent>
          </Card>
        </div>

        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização do Evento
              </CardTitle>
              <CardDescription>
                {fullAddress}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {useStaticMap ? (
                <StaticMap 
                  address={fullAddress} 
                  className="h-96" 
                />
              ) : (
                <GoogleMap 
                  address={fullAddress} 
                  className="h-96" 
                />
              )}
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setUseStaticMap(!useStaticMap)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {useStaticMap ? "Usar mapa interativo" : "Usar mapa estático"}
                </button>
                
                {geocodeResult && (
                  <div className="text-xs text-gray-500">
                    {useStaticMap ? "Mapa estático" : "Mapa interativo"}
                  </div>
                )}
              </div>
              
              {geocodeResult && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Endereço completo:</span>
                  </div>
                  <p className="text-sm font-medium pl-6">
                    {geocodeResult.formatted_address}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Coordenadas:</span>
                  </div>
                  <p className="text-sm font-mono pl-6">
                    {geocodeResult.geometry.location.lat.toFixed(6)}, {geocodeResult.geometry.location.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}





