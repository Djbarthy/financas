# 🔧 Guia de Debug - Botão de Teste

## Funcionalidade Implementada

O botão "Debug" agora mostra um painel modal com informações detalhadas sobre:
- Status dos contextos (Financial e Auth)
- Props do componente
- Estado interno
- Erros específicos

## Como Usar

### 1. **Acesse o Dashboard**
- Vá para `/dashboard`
- Faça login se necessário

### 2. **Clique no Botão Debug**
- Procure o botão "Debug" no header (ícone de alerta)
- Clique para abrir o painel de informações

### 3. **Analise as Informações**
O painel mostrará:

```
=== DEBUG INFO ===

1. Testando Contexto Financeiro:
   ✅ useFinancial() funcionando
   - activeWallet: null
   - wallets: 0
   - syncing: false
   - lastSync: null

2. Testando Contexto de Autenticação:
   ✅ useAuth() funcionando
   - user: seu@email.com
   - loading: false

3. Props do Componente:
   - currentView: transactions
   - onViewChange: function
   - onMenuClick: function

4. Estado do Componente:
   - debugInfo: vazio
   - showDebug: true

5. Verificação de Providers:
   ✅ Ambos os contextos estão disponíveis
```

### 4. **Ações Disponíveis**
- **Copiar**: Copia as informações para a área de transferência
- **Limpar**: Limpa as informações e fecha o painel
- **Fechar**: Fecha o painel sem limpar

## 🔍 Interpretando os Resultados

### ✅ Se Tudo Estiver OK:
- Todos os contextos funcionando
- Props corretas
- Sem erros

### ❌ Se Houver Problemas:

#### Erro no Contexto Financeiro:
```
❌ Erro no useFinancial(): Contexto financeiro não disponível
```
**Solução**: Verificar se `FinancialProvider` está envolvendo o componente

#### Erro no Contexto de Autenticação:
```
❌ Erro no useAuth(): Contexto de autenticação não disponível
```
**Solução**: Verificar se `AuthProvider` está envolvendo o componente

#### Erro Geral:
```
❌ ERRO GERAL: [mensagem de erro]
```
**Solução**: Verificar console do navegador para mais detalhes

## 📝 Como Reportar Problemas

1. **Clique no botão Debug**
2. **Copie as informações** (botão "Copiar")
3. **Cole aqui** as informações copiadas
4. **Descreva o que você vê** na tela

## 🎯 Status Atual

- ✅ Botão de debug implementado
- ✅ Painel modal com informações detalhadas
- ✅ Teste de contextos individual
- ✅ Função de copiar informações
- ⏳ Aguardando teste do usuário 