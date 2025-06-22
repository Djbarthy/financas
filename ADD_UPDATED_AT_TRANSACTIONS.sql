-- Adicionar campo updated_at na tabela transactions se não existir
-- Execute este comando no SQL Editor do Supabase

-- Verificar se o campo updated_at já existe na tabela transactions
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

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'updated_at';

-- Verificar dados existentes
SELECT id, description, created_at, updated_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5; 