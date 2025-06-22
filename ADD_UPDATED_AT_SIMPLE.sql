-- Adicionar campo updated_at na tabela transactions (versão simples)
-- Execute este comando no SQL Editor do Supabase

-- Verificar se o campo updated_at já existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'updated_at';

-- Adicionar o campo se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar registros existentes que não têm updated_at
UPDATE transactions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'updated_at';

-- Verificar dados existentes
SELECT id, description, created_at, updated_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5; 