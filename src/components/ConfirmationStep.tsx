import React from 'react';
import { Button } from '@/components/ui/button';
import { TransactionFormData } from '@/hooks/useTransactionForm';
import { getCategoryInfo } from '@/utils/categories';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ConfirmationStepProps {
  formData: TransactionFormData;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  formData,
  onSubmit,
  isSubmitDisabled,
}) => {
  return (
    <div className="text-center space-y-6 p-4">
      <h3 className="text-2xl font-bold text-brand-primary">Confirmação</h3>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium" style={{ color: formData.type === 'income' ? '#b66e6f' : '#cf8884' }}>
              {formData.type === 'income' ? 'Receita' : 'Despesa'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valor:</span>
            <span className="font-medium">{formatCurrency(parseFloat(formData.amount) / 100)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">{formData.date.toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Categoria:</span>
            <span className="font-medium">{getCategoryInfo(formData.category).label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Paga ✅</span>
          </div>
        </div>
        
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="w-full bg-brand-rose-earthy hover:bg-brand-rose-light text-white py-3 flex items-center justify-center space-x-2"
        >
          <Check size={20} />
          <span>Confirmar Transação</span>
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
