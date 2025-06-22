export interface Wallet {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: number;
  description?: string;
  date: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type TransactionCategory = 
  | 'fixed'
  | 'food'
  | 'leisure'
  | 'debt'
  | 'transport'
  | 'health'
  | 'other'
  | 'uber';

export interface CategoryInfo {
  key: TransactionCategory;
  label: string;
  icon: string;
  color: string;
}

export type ChartType = 'pie' | 'bar' | 'line' | 'doughnut' | 'stacked';

export type TimePeriod = '7d' | '15d' | '30d' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
