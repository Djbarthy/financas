
import { useState } from 'react';
import { TransactionCategory } from '@/types/financial';

export interface TransactionFormData {
  type: 'income' | 'expense' | null;
  amount: string;
  date: Date;
  category: TransactionCategory;
  description: string;
  isPaid: boolean;
}

export const useTransactionForm = () => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: null,
    amount: '',
    date: new Date(),
    category: 'other',
    description: '',
    isPaid: true, // Sempre definido como pago por padrão
  });

  const resetFormExceptType = () => {
    setFormData(prev => ({
      type: prev.type,
      amount: '',
      date: new Date(),
      category: 'other',
      description: '',
      isPaid: true, // Sempre definido como pago
    }));
  };

  const updateFormData = (updates: Partial<TransactionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isFormValid = () => {
    return formData.type && formData.amount && parseFloat(formData.amount) > 0;
  };

  return {
    formData,
    updateFormData,
    resetFormExceptType,
    isFormValid,
  };
};
