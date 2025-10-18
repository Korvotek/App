-- =====================================================
-- MIGRAÇÃO CORRIGIDA: Baseada na estrutura real do banco
-- =====================================================

-- Este script altera a foreign key da tabela events
-- para referenciar conta_azul_customers em vez de parties

-- 1. Remover a foreign key constraint atual
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_client_id_fkey;

-- 2. Adicionar nova foreign key constraint para conta_azul_customers
ALTER TABLE events ADD CONSTRAINT events_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES conta_azul_customers(id);

-- 3. Adicionar campos para performance (opcional)
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_document TEXT;

-- 4. Comentário para documentação
COMMENT ON CONSTRAINT events_client_id_fkey ON events IS 'Referência ao cliente na tabela conta_azul_customers';

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- A tabela event_services já existe e referencia products_services
-- Não é necessário criar uma nova tabela
-- O código já foi ajustado para usar products_services
-- =====================================================

