-- Adicionar campo parent_id à tabela wallets para suportar sub-carteiras
-- Execute este comando no SQL Editor do Supabase

-- Verificar se o campo já existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wallets' AND column_name = 'parent_id';

-- Adicionar o campo se não existir
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES wallets(id) ON DELETE CASCADE;

-- Criar índice para melhorar performance das consultas de sub-carteiras
CREATE INDEX IF NOT EXISTS idx_wallets_parent_id ON wallets(parent_id);

-- Verificar se foi adicionado
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wallets' AND column_name = 'parent_id';

-- Verificar dados existentes
SELECT id, name, parent_id, created_at 
FROM wallets 
ORDER BY created_at DESC 
LIMIT 10; 