-- =====================================================
-- ROLLBACK: Reverter mudanças para usar parties novamente
-- =====================================================

-- ATENÇÃO: Este script reverte as mudanças feitas na migração
-- Execute apenas se necessário reverter para a estrutura anterior

-- 1. Remover a nova foreign key constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_client_id_fkey;

-- 2. Restaurar a foreign key constraint original para parties
ALTER TABLE events ADD CONSTRAINT events_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES parties(id);

-- 3. Remover campos adicionais (opcional)
ALTER TABLE events DROP COLUMN IF EXISTS client_name;
ALTER TABLE events DROP COLUMN IF EXISTS client_document;

-- 4. Remover tabela event_services
DROP TABLE IF EXISTS event_services CASCADE;

-- 5. Remover função e trigger
DROP TRIGGER IF EXISTS update_event_services_updated_at ON event_services;
DROP FUNCTION IF EXISTS update_updated_at_column();

