import Dexie, { Table } from 'dexie';
import { Wallet, Transaction } from '@/types/financial';

export interface SyncQueueItem {
  id?: number;
  action: 'upsert' | 'delete';
  table: 'wallets' | 'transactions';
  payload: any;
  timestamp: string;
}

export class AppDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  transactions!: Table<Transaction, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FinancialAppDatabase');
    this.version(1).stores({
      // Usamos '&id' para indicar que o ID é a chave primária, mas não é auto-incrementado (usaremos UUIDs)
      wallets: '&id, name, parentId, userId, updatedAt',
      transactions: '&id, walletId, userId, date, updatedAt',
      // Usamos '++id' para um ID auto-incrementado simples para a fila
      sync_queue: '++id, timestamp',
    });
  }
}

export const dexieDB = new AppDatabase(); 