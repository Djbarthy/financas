import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { Wallet, Transaction } from '@/types/financial';
import { useAuth } from './AuthContext';
import { supabaseService } from '@/integrations/supabase/services';
import { dexieDB } from '@/services/dexie';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface FinancialContextType {
  wallets: Wallet[] | undefined;
  transactions: Transaction[] | undefined;
  activeWallet: Wallet | null;
  loading: boolean;
  syncing: boolean;
  isOnline: boolean;
  setActiveWallet: (wallet: Wallet | null) => void;
  getWalletBalance: (walletId: string) => number;
  createWallet: (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'balance' | 'currency'>) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  createTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  flushSyncQueue: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const wallets = useLiveQuery(() => user ? dexieDB.wallets.where('userId').equals(user.id).toArray() : [], [user]);
  const transactions = useLiveQuery(() => user ? dexieDB.transactions.where('userId').equals(user.id).toArray() : [], [user]);
  
  const loading = wallets === undefined || transactions === undefined;

  useEffect(() => {
    const syncRemoteDataToLocal = async () => {
      if (!user) return;

      console.log('🔄 Sincronizando dados do servidor para o local...');
      const toastId = 'initial-sync';
      toast.info('Sincronizando seus dados...', { id: toastId });
      
      try {
        const { wallets: remoteWallets, transactions: remoteTransactions } = await supabaseService.fetchAll();

        if (remoteWallets) {
          // O serviço já deve retornar os dados em camelCase, mas garantimos aqui
          const walletsToStore = remoteWallets.map(w => ({
            id: w.id,
            userId: w.user_id || w.userId,
            name: w.name,
            balance: w.balance || 0,
            currency: w.currency || 'BRL',
            createdAt: w.created_at || w.createdAt,
            updatedAt: w.updated_at || w.updatedAt,
            parentId: w.parent_id || w.parentId,
            description: w.description,
            imageUrl: w.image_url || w.imageUrl,
            color: w.color,
          }));
          await dexieDB.wallets.bulkPut(walletsToStore);
        }

        if (remoteTransactions) {
          await dexieDB.transactions.bulkPut(remoteTransactions);
        }

        console.log('✅ Sincronização inicial concluída.');
        toast.success('Dados sincronizados com sucesso!', { id: toastId });
        
        // Após a sincronização, tenta enviar qualquer item pendente na fila
        flushSyncQueue();

      } catch (error) {
        console.error('❌ Falha na sincronização inicial:', error);
        toast.error('Falha ao buscar seus dados.', { id: toastId });
      }
    };

    syncRemoteDataToLocal();

  }, [user]);

  useEffect(() => {
    supabaseService.setUser(user);
  }, [user]);

  const flushSyncQueue = useCallback(async () => {
    if (!isOnline || syncing || !user) {
      if (!isOnline) console.log('🚫 Offline, sincronização adiada.');
      return;
    }
    
    setSyncing(true);
    const queue = await dexieDB.sync_queue.orderBy('timestamp').toArray();
    
    if (queue.length === 0) {
      setSyncing(false);
      return;
    }

    console.log('🔄 Verificando a fila de sincronização...');
    toast.info('Sincronizando dados...', { id: 'sync-toast' });
    
    let initialQueueLength = queue.length;
    let success = true;
    
    for (const item of queue) {
      try {
        if (item.action === 'upsert') {
          await supabaseService.upsert(item.table, item.payload);
        } else if (item.action === 'delete') {
          await supabaseService.delete(item.table, item.payload.id);
        }
        await dexieDB.sync_queue.delete(item.id!);
        console.log(`✅ Item #${item.id} (${item.action} em ${item.table}) sincronizado.`);
      } catch (error) {
        console.error(`❌ Falha ao sincronizar o item #${item.id}. Ele permanecerá na fila. Erro:`, error);
        toast.error('Falha na sincronização. Verifique o console.', { id: 'sync-toast' });
        success = false;
        break;
      }
    }

    if (success && initialQueueLength > 0) {
      toast.success(`Sincronização concluída! ${initialQueueLength} itens processados.`, { id: 'sync-toast' });
    }
    
    // A etapa abaixo foi removida para evitar que o estado local seja sobrescrito
    // com dados potencialmente desatualizados do servidor, o que estava causando
    // a percepção de que a sincronização não funcionava. A UI já é atualizada
    // de forma otimista, e a sincronização agora foca em enviar as mudanças locais.
    // console.log('☁️ Buscando dados mais recentes do servidor...');
    // try {
    //     const remoteData = await supabaseService.fetchAll();
    //     if (remoteData.wallets) await dexieDB.wallets.bulkPut(remoteData.wallets);
    //     if (remoteData.transactions) await dexieDB.transactions.bulkPut(remoteData.transactions);
    //     console.log('✅ Banco de dados local atualizado com os dados do servidor.');
    //     toast.success(`Sincronização concluída! ${initialQueueLength} itens processados.`, { id: 'sync-toast' });
    // } catch (error) {
    //     console.error('❌ Erro ao buscar dados do servidor:', error);
    //     toast.error('Falha ao buscar dados do servidor.', { id: 'sync-toast' });
    // }

    setSyncing(false);
  }, [syncing, user, isOnline]);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Dispositivo está online');
      setIsOnline(true);
      flushSyncQueue();
    };

    const handleOffline = () => {
      console.log('🔴 Dispositivo está offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushSyncQueue]);

  useEffect(() => {
    if (wallets && !activeWallet) {
      setActiveWallet(wallets[0] || null);
    }
  }, [wallets, activeWallet]);

  const createWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar uma carteira.");
      return;
    }

    const walletPayload = {
      ...walletData,
      user_id: user.id, // A função espera snake_case
    };

    try {
      const { data: rawData, error } = await supabase.functions.invoke('create-wallet', {
        body: { wallet: walletPayload },
      });

      if (error) {
        toast.error("Erro ao criar carteira: " + error.message);
        throw error;
      }
      
      // Converte o objeto retornado (com snake_case) para o formato do app (camelCase)
      const returnedWallet = rawData.wallet;
      const wallet: Wallet = {
          id: returnedWallet.id,
          userId: returnedWallet.user_id,
          name: returnedWallet.name,
          balance: returnedWallet.balance || 0,
          currency: returnedWallet.currency || 'BRL',
          createdAt: returnedWallet.created_at,
          updatedAt: returnedWallet.updated_at,
          parentId: returnedWallet.parent_id,
          description: returnedWallet.description,
          imageUrl: returnedWallet.image_url,
          color: returnedWallet.color,
      };

      await dexieDB.wallets.add(wallet);
      toast.success("Carteira criada com sucesso!");

    } catch (e: any) {
      console.error("Falha ao invocar a Edge Function 'create-wallet':", e);
      toast.error("Não foi possível conectar ao servidor para criar a carteira.");
    }
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    const updatedWallet = { ...updates, updatedAt: new Date().toISOString() };
    await dexieDB.wallets.update(id, updatedWallet);
    const fullWallet = await dexieDB.wallets.get(id);
    if (fullWallet) {
      await dexieDB.sync_queue.add({ action: 'upsert', table: 'wallets', payload: fullWallet, timestamp: updatedWallet.updatedAt });
    }
    flushSyncQueue();
  };

  const deleteWallet = async (id:string) => {
    await dexieDB.wallets.delete(id);
    await dexieDB.sync_queue.add({ action: 'delete', table: 'wallets', payload: { id }, timestamp: new Date().toISOString() });
    flushSyncQueue();
  };

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar uma transação.");
      return;
    }

    const transactionPayload = {
      ...transactionData,
      user_id: user.id, // A função espera snake_case
    };

    try {
      const { data, error } = await supabase.functions.invoke('create-transaction', {
        body: { transaction: transactionPayload },
      });

      if (error) {
        toast.error("Erro ao criar transação: " + error.message);
        throw error;
      }
      
      // A função retorna a transação completa do banco. Adicionamos ao Dexie local.
      await dexieDB.transactions.add(data.transaction);
      toast.success("Transação criada com sucesso!");

    } catch (e: any) {
      console.error("Falha ao invocar a Edge Function 'create-transaction':", e);
      if (!e.message.includes("já existe")) {
        toast.error("Não foi possível conectar ao servidor para criar a transação.");
      }
    }
  };
  
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updatedTransaction = { ...updates, updatedAt: new Date().toISOString() };
    await dexieDB.transactions.update(id, updatedTransaction);
    const fullTransaction = await dexieDB.transactions.get(id);
    if(fullTransaction) {
        await dexieDB.sync_queue.add({ action: 'upsert', table: 'transactions', payload: fullTransaction, timestamp: updatedTransaction.updatedAt });
    }
    flushSyncQueue();
  };

  const deleteTransaction = async (id: string) => {
    await dexieDB.transactions.delete(id);
    await dexieDB.sync_queue.add({ action: 'delete', table: 'transactions', payload: { id }, timestamp: new Date().toISOString() });
    flushSyncQueue();
  };

  const getWalletBalance = (walletId: string) => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.walletId === walletId)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  };
  
  const value = {
    wallets, transactions, activeWallet, loading, syncing, isOnline, setActiveWallet, getWalletBalance, createWallet, updateWallet, deleteWallet, createTransaction, updateTransaction, deleteTransaction, flushSyncQueue
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
