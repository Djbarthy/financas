-- Adicionar campo updated_at na tabela transactions (versão segura)
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

-- Verificar se a função já existe antes de criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    END IF;
END $$;

-- Verificar se o trigger já existe antes de criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_transactions_updated_at'
    ) THEN
        CREATE TRIGGER update_transactions_updated_at
            BEFORE UPDATE ON transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'updated_at';

-- Verificar trigger criado
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'transactions' 
AND trigger_name = 'update_transactions_updated_at';

-- Verificar dados existentes
SELECT id, description, created_at, updated_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5; 