import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionCategory } from '@/types/financial';
import { getCategoryInfo, UberLogo } from '@/utils/categories';
import { 
  Home, 
  UtensilsCrossed, 
  Gamepad2, 
  CreditCard, 
  Car, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';

const iconMap = {
  Home,
  UtensilsCrossed,
  Gamepad2,
  CreditCard,
  Car,
  Heart,
  MoreHorizontal,
  UberLogo,
};

interface AmountCategoryStepProps {
  amount: string;
  selectedCategory: TransactionCategory;
  onAmountChange: (value: string) => void;
  onCategorySelect: (category: TransactionCategory) => void;
}

const AmountCategoryStep: React.FC<AmountCategoryStepProps> = ({
  amount,
  selectedCategory,
  onAmountChange,
  onCategorySelect
}) => {
  const categories: TransactionCategory[] = ['fixed', 'food', 'leisure', 'debt', 'transport', 'health', 'uber', 'other'];

  // Função para formatar valor digitado como moeda
  const formatCurrencyInput = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '');
    const cents = parseInt(onlyNumbers, 10);
    if (isNaN(cents)) return '';
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isValid = amount && parseInt(amount, 10) > 0 && selectedCategory;

  return (
    <div className="text-center space-y-6 p-4">
      <h3 className="text-2xl font-bold text-brand-primary">Valor e Categoria</h3>
      
      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={formatCurrencyInput(amount)}
            onChange={(e) => onAmountChange(e.target.value.replace(/\D/g, ''))}
            className="text-4xl text-center h-20 font-bold border-2 border-brand-primary"
            maxLength={12}
            style={{ fontSize: '2.5rem', height: '4.5rem' }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const categoryInfo = getCategoryInfo(category);
            const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap];
            
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => onCategorySelect(category)}
                className="h-16 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
                style={{
                  backgroundColor: selectedCategory === category ? categoryInfo.color : undefined,
                  color: selectedCategory === category ? 'white' : undefined,
                }}
              >
                <IconComponent size={20} />
                <span className="text-xs">{categoryInfo.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex justify-end pt-4">
          {/* Remover botão avançar */}
        </div>
      </div>
    </div>
  );
};

export default AmountCategoryStep;
