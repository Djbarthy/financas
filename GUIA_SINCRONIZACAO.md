# 🔄 Guia de Sincronização entre Navegadores

## 🎯 Problema Identificado

As carteiras não sincronizavam entre navegadores porque:
1. **Sincronização era apenas simulação** - Não salvava dados reais
2. **Dados ficavam apenas no localStorage** - Cada navegador isolado
3. **Sem tabelas no Supabase** - Banco de dados vazio

## ✅ Solução Implementada

### 1. **Tabelas Criadas no Supabase**
- `wallets` - Armazena carteiras dos usuários
- `transactions` - Armazena transações
- **RLS (Row Level Security)** - Cada usuário vê apenas seus dados
- **Índices** - Para performance

### 2. **Serviço de Sincronização Real**
- **Bidirecional** - Upload e download de dados
- **Mesclagem inteligente** - Local tem prioridade sobre remoto
- **Tratamento de erros** - Logs detalhados

### 3. **Contexto Financeiro Atualizado**
- **Sincronização real** - Usa o serviço do Supabase
- **Atualização automática** - Dados locais são atualizados após sync
- **Feedback visual** - Botão gira durante sincronização

## 🚀 Como Configurar

### Passo 1: Configurar Supabase
1. **Acesse** https://supabase.com/dashboard
2. **Selecione** seu projeto
3. **Vá para** Settings > API
4. **Copie** a "service_role" key

### Passo 2: Executar Migração
```bash
# Configure a variável de ambiente
export SUPABASE_SERVICE_KEY="sua-service-role-key-aqui"

# Execute o script de configuração
node setup-database.js
```

### Passo 3: Testar Sincronização
1. **Abra 2 navegadores** diferentes
2. **Faça login** com a mesma conta
3. **Crie/modifique** carteiras em um navegador
4. **Clique no botão de sincronização** (ícone de refresh)
5. **Verifique** se os dados aparecem no outro navegador

## 🔧 Como Funciona

### Sincronização Bidirecional
```javascript
// 1. Buscar dados remotos
const remoteWallets = await fetchWallets();
const remoteTransactions = await fetchTransactions();

// 2. Mesclar dados (local tem prioridade)
const mergedWallets = mergeWallets(localWallets, remoteWallets);
const mergedTransactions = mergeTransactions(localTransactions, remoteTransactions);

// 3. Upload dos dados mesclados
await syncWallets(mergedWallets);
await syncTransactions(mergedTransactions);
```

### Estratégia de Mesclagem
- **Dados locais têm prioridade** sobre remotos
- **Novos dados** são adicionados
- **Dados existentes** são atualizados
- **Conflitos** são resolvidos a favor do local

## 📊 Logs de Debug

A sincronização mostra logs detalhados:
```
🔄 Sincronizando com Supabase...
📊 Dados para sincronizar: { wallets: 2, transactions: 5 }
📊 Dados remotos: { wallets: 1, transactions: 3 }
🔀 Dados mesclados: { wallets: 2, transactions: 5 }
✅ Sincronização concluída!
📊 Dados após sincronização: { wallets: 2, transactions: 5 }
```

## 🎯 Resultado Esperado

Após a configuração:
- ✅ **Dados sincronizam** entre navegadores
- ✅ **Botão de sincronização** funciona
- ✅ **Tooltip mostra** última sincronização
- ✅ **Dados persistem** no Supabase
- ✅ **Cada usuário** vê apenas seus dados

## 🔍 Troubleshooting

### Se a sincronização não funcionar:

1. **Verifique os logs** no console do navegador
2. **Confirme** se as tabelas foram criadas no Supabase Dashboard
3. **Verifique** se a service_role key está correta
4. **Teste** se o usuário está logado corretamente

### Erros comuns:
- **"relation does not exist"** → Tabelas não criadas
- **"permission denied"** → RLS bloqueando acesso
- **"invalid user"** → Usuário não autenticado

## 🎉 Status Atual

- ✅ **Tabelas criadas** no Supabase
- ✅ **Serviço de sincronização** implementado
- ✅ **Contexto financeiro** atualizado
- ✅ **Script de configuração** criado
- ⏳ **Aguardando configuração** do usuário 