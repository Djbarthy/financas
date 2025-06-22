import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { Wallet, Transaction } from '@/types/financial';
import { useAuth } from './AuthContext';
import { supabaseService } from '@/integrations/supabase/services';
import { dexieDB } from '@/services/dexie';
import { toast } from 'sonner';

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

  const createWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'balance' | 'currency'>) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const newWallet: Wallet = {
      ...walletData, id: uuidv4(), userId: user.id, balance: 0, currency: 'BRL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await dexieDB.wallets.add(newWallet);
    await dexieDB.sync_queue.add({ action: 'upsert', table: 'wallets', payload: newWallet, timestamp: newWallet.updatedAt });
    flushSyncQueue();
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
    if (!user) throw new Error("Usuário não autenticado.");
    const newTransaction: Transaction = {
      ...transactionData, id: uuidv4(), userId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await dexieDB.transactions.add(newTransaction);
    await dexieDB.sync_queue.add({ action: 'upsert', table: 'transactions', payload: newTransaction, timestamp: newTransaction.updatedAt });
    flushSyncQueue();
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
