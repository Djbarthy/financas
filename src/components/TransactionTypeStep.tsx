import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionTypeStepProps {
  onTypeSelect: (type: 'income' | 'expense') => void;
}

const TransactionTypeStep: React.FC<TransactionTypeStepProps> = ({ 
  onTypeSelect 
}) => {
  return (
    <div className="text-center space-y-6 p-4">
      <h3 className="text-2xl font-bold text-brand-primary">Tipo de Transação</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
        <Button
          onClick={() => onTypeSelect('income')}
          className="h-24 flex flex-col items-center justify-center space-y-2 text-white hover:scale-105 transition-transform bg-green-600 hover:bg-green-700"
        >
          <TrendingUp size={32} />
          <span className="text-lg font-semibold">Receita</span>
        </Button>
        <Button
          onClick={() => onTypeSelect('expense')}
          className="h-24 flex flex-col items-center justify-center space-y-2 text-white hover:scale-105 transition-transform bg-red-600 hover:bg-red-700"
        >
          <TrendingDown size={32} />
          <span className="text-lg font-semibold">Despesa</span>
        </Button>
      </div>
    </div>
  );
};

export default TransactionTypeStep;
