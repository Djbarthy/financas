import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Transaction, TransactionCategory } from '@/types/financial';
import { getCategoryInfo } from '@/utils/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Home, 
  UtensilsCrossed, 
  Gamepad2, 
  CreditCard, 
  Car, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';
import { UberLogo } from '@/utils/categories';

interface EditTransactionFormProps {
  transaction: Transaction;
  onClose: () => void;
}

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

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ transaction, onClose }) => {
  const { updateTransaction } = useFinancial();
  const [formData, setFormData] = useState({
    amount: (transaction.amount * 100).toString(),
    type: transaction.type,
    date: new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.description,
    category: transaction.category,
  });

  const formatCurrencyInput = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '');
    const cents = parseInt(onlyNumbers, 10);
    if (isNaN(cents)) return '';
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, amount: onlyNumbers }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      return;
    }

    updateTransaction(transaction.id, {
      amount: parseFloat(formData.amount) / 100,
      type: formData.type,
      date: new Date(formData.date),
      description: formData.description,
      category: formData.category,
    });

    onClose();
  };

  const categories: TransactionCategory[] = [
    'fixed', 'food', 'leisure', 'debt', 'transport', 'health', 'uber', 'other'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-primary dark:text-brand-yellow-pastel">
            Editar Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={formatCurrencyInput(formData.amount)}
                onChange={handleAmountChange}
                required
                maxLength={12}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da transação"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value: TransactionCategory) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const categoryInfo = getCategoryInfo(category);
                  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap];
                  
                  return (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: categoryInfo.color }}
                        />
                        <span>{categoryInfo.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-rose-earthy hover:bg-brand-rose-light"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionForm;
