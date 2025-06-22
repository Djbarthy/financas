# 📝 Migração Manual no Supabase Dashboard

## 🎯 Método Alternativo (Mais Simples)

Se você não quiser configurar a service_role key, pode aplicar as migrações manualmente:

## 📋 Passo a Passo

### 1. Acessar o Supabase Dashboard
1. **Vá para** https://supabase.com/dashboard
2. **Selecione** seu projeto
3. **Clique** em "SQL Editor" no menu lateral

### 2. Executar a Migração
1. **Clique** em "New query"
2. **Cole** o seguinte SQL:

```sql
-- Criação das tabelas para sincronização
-- Migration: 001_create_tables.sql

-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Tabela de carteiras
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id TEXT REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category TEXT,
    is_paid BOOLEAN DEFAULT true,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Políticas RLS para wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallets" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" ON wallets
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_wallets_updated_at 
    BEFORE UPDATE ON wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Clique** em "Run" para executar

### 3. Verificar se Funcionou
1. **Vá para** "Table Editor" no menu lateral
2. **Verifique** se as tabelas `wallets` e `transactions` aparecem
3. **Clique** em cada tabela para ver a estrutura

## ✅ Confirmação

Se tudo funcionou, você verá:
- ✅ **Tabela `wallets`** criada com colunas: id, user_id, name, color, image_url, created_at, updated_at
- ✅ **Tabela `transactions`** criada com colunas: id, user_id, wallet_id, type, amount, description, category, is_paid, date, created_at, updated_at
- ✅ **Políticas RLS** configuradas (cada usuário vê apenas seus dados)

## 🚀 Testar Sincronização

Após criar as tabelas:
1. **Abra 2 navegadores** diferentes
2. **Faça login** com a mesma conta
3. **Crie uma carteira** em um navegador
4. **Clique no botão de sincronização** (ícone de refresh)
5. **Verifique** se a carteira aparece no outro navegador

## 🔍 Troubleshooting

### Se der erro:
- **"relation already exists"** → Tabelas já foram criadas (normal)
- **"permission denied"** → Você não tem permissão (use service_role key)
- **"syntax error"** → Verifique se copiou o SQL completo

### Se não funcionar:
1. **Verifique** se está no projeto correto
2. **Confirme** se as tabelas foram criadas
3. **Teste** a sincronização no aplicativo
4. **Verifique** os logs no console do navegador

## 🎉 Próximos Passos

Após criar as tabelas:
1. **Teste a sincronização** entre navegadores
2. **Verifique os logs** no console
3. **Confirme** que os dados aparecem no Supabase Dashboard
4. **Teste** criar/modificar/deletar carteiras e transações 