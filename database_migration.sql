-- =====================================================
-- MIGRAÇÃO: Modificar eventos para usar Conta Azul diretamente
-- =====================================================

-- 1. Criar tabela event_services para armazenar serviços do Conta Azul
CREATE TABLE IF NOT EXISTS event_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    conta_azul_service_id UUID NOT NULL REFERENCES conta_azul_services(id),
    service_name TEXT NOT NULL,
    daily_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    days INTEGER NOT NULL DEFAULT 1,
    quantity INTEGER NOT NULL DEFAULT 1,
    observations TEXT,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID NOT NULL REFERENCES tenants(id)
);

-- 2. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_event_services_event_id ON event_services(event_id);
CREATE INDEX IF NOT EXISTS idx_event_services_conta_azul_service_id ON event_services(conta_azul_service_id);
CREATE INDEX IF NOT EXISTS idx_event_services_tenant_id ON event_services(tenant_id);

-- 3. Remover a foreign key constraint atual de events.client_id -> parties.id
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_client_id_fkey;

-- 4. Adicionar nova foreign key constraint para events.client_id -> conta_azul_customers.id
ALTER TABLE events ADD CONSTRAINT events_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES conta_azul_customers(id);

-- 5. Adicionar campos para armazenar dados do cliente diretamente (opcional, para performance)
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_document TEXT;

-- 6. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_services_updated_at 
    BEFORE UPDATE ON event_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Migrar dados existentes (se houver)
-- Este script assume que você já tem dados na tabela events
-- Você pode executar este bloco separadamente após testar

/*
-- Migrar serviços existentes do JSON para a nova tabela
INSERT INTO event_services (
    event_id,
    conta_azul_service_id,
    service_name,
    daily_value,
    days,
    quantity,
    observations,
    total_value,
    tenant_id
)
SELECT 
    e.id as event_id,
    cas.id as conta_azul_service_id,
    service->>'serviceName' as service_name,
    (service->>'dailyValue')::DECIMAL as daily_value,
    (service->>'days')::INTEGER as days,
    (service->>'quantity')::INTEGER as quantity,
    service->>'observations' as observations,
    (service->>'totalValue')::DECIMAL as total_value,
    e.tenant_id
FROM events e,
LATERAL jsonb_array_elements(e.services::jsonb) as service
LEFT JOIN conta_azul_services cas ON cas.external_id = service->>'serviceId'
WHERE e.services IS NOT NULL AND e.services != '[]'::jsonb;
*/

-- 8. Comentários para documentação
COMMENT ON TABLE event_services IS 'Serviços do Conta Azul associados a eventos';
COMMENT ON COLUMN event_services.event_id IS 'Referência ao evento';
COMMENT ON COLUMN event_services.conta_azul_service_id IS 'Referência ao serviço do Conta Azul';
COMMENT ON COLUMN event_services.daily_value IS 'Valor diário do serviço';
COMMENT ON COLUMN event_services.days IS 'Número de diárias';
COMMENT ON COLUMN event_services.quantity IS 'Quantidade do serviço';
COMMENT ON COLUMN event_services.total_value IS 'Valor total calculado (daily_value * days * quantity)';

