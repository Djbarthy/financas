import { supabase } from './client';
import { Wallet, Transaction } from '@/types/financial';
import { User } from '@supabase/supabase-js';

// Funções de mapeamento para converter de camelCase (app) para snake_case (DB)
const mapAppWalletToDb = (wallet: Wallet) => ({
  id: wallet.id,
  user_id: wallet.userId,
  name: wallet.name,
  parent_id: wallet.parentId,
  color: wallet.color,
  image_url: wallet.imageUrl,
  created_at: wallet.createdAt,
  updated_at: wallet.updatedAt,
});

const mapAppTransactionToDb = (transaction: Transaction) => ({
  id: transaction.id,
  user_id: transaction.userId,
  wallet_id: transaction.walletId,
  type: transaction.type,
  amount: transaction.amount,
  description: transaction.description,
  category: transaction.category,
  is_paid: transaction.isPaid,
  date: transaction.date,
  created_at: transaction.createdAt,
  updated_at: transaction.updatedAt,
});

// Funções de mapeamento para converter de snake_case (DB) para camelCase (app)
const mapDbWalletToApp = (dbWallet: any): Wallet => ({
  id: dbWallet.id,
  userId: dbWallet.user_id,
  name: dbWallet.name,
  parentId: dbWallet.parent_id,
  color: dbWallet.color,
  imageUrl: dbWallet.image_url,
  createdAt: dbWallet.created_at,
  updatedAt: dbWallet.updated_at,
  balance: 0, 
  currency: 'BRL',
});

const mapDbTransactionToApp = (dbTransaction: any): Transaction => ({
  id: dbTransaction.id,
  userId: dbTransaction.user_id,
  walletId: dbTransaction.wallet_id,
  type: dbTransaction.type,
  amount: parseFloat(dbTransaction.amount),
  description: dbTransaction.description,
  category: dbTransaction.category,
  isPaid: dbTransaction.is_paid,
  date: dbTransaction.date,
  createdAt: dbTransaction.created_at,
  updatedAt: dbTransaction.updated_at,
});


export class SupabaseService {
  private user: User | null = null;
  
  setUser(user: User | null) { this.user = user; }
  private getUserId(): string {
    if (!this.user) throw new Error("Usuário não está definido no SupabaseService.");
    return this.user.id;
  }

  async upsert(table: 'wallets' | 'transactions', data: any) {
    const userId = this.getUserId();
    let payload;

    if (table === 'wallets') {
      payload = mapAppWalletToDb(data);
    } else {
      payload = mapAppTransactionToDb(data);
    }
    
    // Garante que o user_id esteja correto
    payload.user_id = userId;

    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`Erro no upsert da tabela ${table}:`, error);
      throw error;
    }
  }

  async delete(table: 'wallets' | 'transactions', id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Erro ao deletar na tabela ${table}:`, error);
      throw error;
    }
  }

  async fetchAll(): Promise<{ wallets: Wallet[], transactions: Transaction[] }> {
    const userId = this.getUserId();
    
    const [walletsResult, transactionsResult] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId)
    ]);

    if (walletsResult.error) throw walletsResult.error;
    if (transactionsResult.error) throw transactionsResult.error;

    const wallets = walletsResult.data.map(mapDbWalletToApp);
    const transactions = transactionsResult.data.map(mapDbTransactionToApp);

    return { wallets, transactions };
  }
}

export const supabaseService = new SupabaseService();
