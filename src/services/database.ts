import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Wallet, Transaction } from '@/types/financial';

const DB_NAME = 'vista85_db';

class DatabaseService {
  private db: SQLiteConnection;
  private isInitialized = false;

  constructor() {
    this.db = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase() {
    if (this.isInitialized) return;

    try {
      const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      await db.open();

      // Criar tabelas se não existirem
      const schema = `
        CREATE TABLE IF NOT EXISTS wallets (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          balance REAL NOT NULL,
          currency TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          parent_id TEXT
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          wallet_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          is_paid BOOLEAN NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
        );
      `;
      await db.execute(schema);
      this.isInitialized = true;
      await db.close();
    } catch (e) {
      console.error('Error initializing database', e);
      throw e;
    }
  }

  // --- Funções CRUD para Carteiras (Wallets) ---
  
  async createWallet(wallet: Wallet) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const query = `INSERT INTO wallets (id, user_id, name, balance, currency, created_at, updated_at, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const params = [wallet.id, wallet.userId, wallet.name, wallet.balance, wallet.currency, wallet.createdAt, wallet.updatedAt, wallet.parentId];
    await db.run(query, params);
    await db.close();
  }

  async updateWallet(id: string, updates: Partial<Wallet>) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const setClauses = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = ?`).join(', ');
    const params = [...Object.values(updates), id];
    const query = `UPDATE wallets SET ${setClauses} WHERE id = ?;`;
    await db.run(query, params);
    await db.close();
  }

  async deleteWallet(id: string) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    // Deletar transações associadas primeiro
    await db.run('DELETE FROM transactions WHERE wallet_id = ?;', [id]);
    await db.run('DELETE FROM wallets WHERE id = ?;', [id]);
    await db.close();
  }
  
  // --- Funções CRUD para Transações (Transactions) ---

  async createTransaction(transaction: Transaction) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const query = `INSERT INTO transactions (id, wallet_id, user_id, type, category, amount, description, date, is_paid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const params = [transaction.id, transaction.walletId, transaction.userId, transaction.type, transaction.category, transaction.amount, transaction.description, transaction.date, transaction.isPaid, transaction.createdAt, transaction.updatedAt];
    await db.run(query, params);
    await db.close();
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const setClauses = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = ?`).join(', ');
    const params = [...Object.values(updates), id];
    const query = `UPDATE transactions SET ${setClauses} WHERE id = ?;`;
    await db.run(query, params);
    await db.close();
  }

  async deleteTransaction(id: string) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    await db.run('DELETE FROM transactions WHERE id = ?;', [id]);
    await db.close();
  }

  // --- Funções para Carteiras (Wallets) ---

  async getWallets(): Promise<Wallet[]> {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const { values } = await db.query('SELECT * FROM wallets;');
    await db.close();
    return values || [];
  }

  async saveWallets(wallets: Wallet[]) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    await db.execute('DELETE FROM wallets;');
    for (const wallet of wallets) {
      const query = `
        INSERT INTO wallets (id, user_id, name, balance, currency, created_at, updated_at, parent_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const params = [
        wallet.id, wallet.userId, wallet.name, wallet.balance, wallet.currency,
        wallet.createdAt, wallet.updatedAt, wallet.parentId
      ];
      await db.run(query, params);
    }
    await db.close();
  }

  // --- Funções para Transações (Transactions) ---

  async getTransactions(): Promise<Transaction[]> {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    const { values } = await db.query('SELECT * FROM transactions;');
    await db.close();
    return values || [];
  }

  async saveTransactions(transactions: Transaction[]) {
    const db = await this.db.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await db.open();
    await db.execute('DELETE FROM transactions;');
    for (const transaction of transactions) {
      const query = `
        INSERT INTO transactions (id, wallet_id, user_id, type, category, amount, description, date, is_paid, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const params = [
        transaction.id, transaction.walletId, transaction.userId, transaction.type,
        transaction.category, transaction.amount, transaction.description,
        transaction.date, transaction.isPaid, transaction.createdAt, transaction.updatedAt
      ];
      await db.run(query, params);
    }
    await db.close();
  }
}

export const dbService = new DatabaseService(); 